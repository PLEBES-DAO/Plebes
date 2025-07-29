mod state;

use candid::{CandidType, Nat, Principal};
use ic_cdk::api::time;
use ic_cdk_macros::{query, update};
use ic_cdk_timers::set_timer;
use num_traits::cast::ToPrimitive;  // Added for to_u64()
use serde::{Deserialize, Serialize};
use icrc_ledger_client_cdk::{CdkRuntime, ICRC1Client};
use icrc_ledger_types::icrc1::account::Account;
use icrc_ledger_types::icrc1::transfer::{TransferArg, TransferError};
use icrc_ledger_types::icrc2::transfer_from::{TransferFromArgs, TransferFromError};
use std::time::Duration;

// Import types from state module - remove ProtocolStats since it's defined in both files
use crate::state::{StakerData, UnlockEvent, State};

// Configuration constants
const STAKE_REWARD_RATE: u64 = 1; // 1 token per day per staked token
const BONUS_START_STAKE: u64 = 100; // 100 token bonus for starting stake
const LOCKUP_PERIOD_NS: u64 = 30 * 24 * 60 * 60 * 1_000_000_000; // 30 days in nanoseconds

// Thread-local storage for the token canister ID
thread_local! {
    static TOKEN_CANISTER_ID: std::cell::RefCell<Principal> = 
        std::cell::RefCell::new(Principal::from_text("olpbc-wyaaa-aaaag-acnya-cai").unwrap()); // Default to ICP ledger
}

#[derive(CandidType, Deserialize, Serialize, Debug)]
pub enum StakingError {
    TransferFailed(TransferFromError),
    TransferError(TransferError),
    CanisterCallFailed(u32, String),
    InsufficientBalance,
    LockupPeriodNotEnded,
    AlreadyStaking,
    NotStaking,
    InvalidAmount,
    InternalError(String),
}

#[derive(CandidType, Serialize, Deserialize)]
pub struct StakingInfo {
    pub staked_amount: Nat,
    pub reward_amount: Nat,
    pub start_time: u64,
    pub last_claim_time: u64,
    pub unlock_time: u64,
}

#[update]
async fn set_token_canister(canister_id: Principal) {
    TOKEN_CANISTER_ID.with(|id| *id.borrow_mut() = canister_id);
}

#[query]
fn get_token_canister() -> Principal {
    TOKEN_CANISTER_ID.with(|id| *id.borrow())
}

#[update]
async fn stake(amount: Nat) -> Result<Nat, StakingError> {
    if amount == Nat::from(0u64) {
        return Err(StakingError::InvalidAmount);
    }

    let caller = ic_cdk::caller();
    let token_canister_id = TOKEN_CANISTER_ID.with(|id| *id.borrow());

    // Check if user is already staking
    if state::read_state(|s| s.stakers.contains_key(&caller)) {
        return Err(StakingError::AlreadyStaking);
    }

    // Transfer tokens from caller to canister's subaccount
    let client = ICRC1Client {
        runtime: CdkRuntime,
        ledger_canister_id: token_canister_id,
    };

    let subaccount = user_subaccount(caller);
    let transfer_args = TransferFromArgs {
        spender_subaccount: None,
        from: caller.into(),
        to: Account {
            owner: ic_cdk::id(),
            subaccount: Some(subaccount),
        },
        amount: amount.clone(),
        fee: None, // Assuming standard fee
        memo: None,
        created_at_time: None,
    };

    match client.transfer_from(transfer_args).await {
        Ok(Ok(block_index)) => {
            let now = time();
            let unlock_time = now + LOCKUP_PERIOD_NS;

            // Create staker data
            let staker_data = StakerData {
                active_stake: amount.clone(),
                pending_unlock: Nat::from(0u64),
                total_staked: amount.clone(),
                total_withdrawn: Nat::from(0u64),
                last_stake_time: now,
            };

            // Create unlock event
            let unlock_event = UnlockEvent {
                amount: amount.clone(),
                unlock_time,
                created_at: now,
                tx_index: Nat::from(0u64), // First transaction
            };

            state::mutate_state(|s| {
                s.stakers.insert(caller, staker_data);
                s.unlock_events.insert(caller, vec![unlock_event]);
                s.transactions.insert(caller, vec![amount.clone()]);
                let amount_clone = amount.clone();  // Create a clone before moving
                s.total_staked += amount_clone;
                s.total_locked += amount;
            });
            // Start daily reward timer
            start_daily_rewards(caller);

            Ok(block_index)
        }
        Ok(Err(e)) => Err(StakingError::TransferFailed(e)),
        Err((code, msg)) => Err(StakingError::CanisterCallFailed(code as u32, msg)),
    }
}

#[update]
async fn start_staking() -> Result<Nat, StakingError> {
    let caller = ic_cdk::caller();
    let token_canister_id = TOKEN_CANISTER_ID.with(|id| *id.borrow());

    // Check if user is already staking
    if state::read_state(|s| s.stakers.contains_key(&caller)) {
        return Err(StakingError::AlreadyStaking);
    }

    // Mint bonus tokens to user's subaccount
    let client = ICRC1Client {
        runtime: CdkRuntime,
        ledger_canister_id: token_canister_id,
    };

    let subaccount = user_subaccount(caller);
    let bonus_amount = Nat::from(BONUS_START_STAKE);

    let transfer_args = TransferArg {
        from_subaccount: None,
        to: Account {
            owner: ic_cdk::id(),
            subaccount: Some(subaccount),
        },
        amount: bonus_amount.clone(),
        fee: None,
        memo: None,
        created_at_time: None,
    };

    match client.transfer(transfer_args).await {
        Ok(Ok(block_index)) => {
            let now = time();
            let unlock_time = now + LOCKUP_PERIOD_NS;

            // Create staker data with bonus amount
            let staker_data = StakerData {
                active_stake: bonus_amount.clone(),
                pending_unlock: Nat::from(0u64),
                total_staked: bonus_amount.clone(),
                total_withdrawn: Nat::from(0u64),
                last_stake_time: now,
            };

            // Create unlock event
            let unlock_event = UnlockEvent {
                amount: bonus_amount.clone(),
                unlock_time,
                created_at: now,
                tx_index: Nat::from(0u64), // First transaction
            };

            // Update state
            state::mutate_state(|s| {
                s.stakers.insert(caller, staker_data);
                s.unlock_events.insert(caller, vec![unlock_event]);
                s.transactions.insert(caller, vec![bonus_amount.clone()]);
                s.total_staked += bonus_amount.clone();
                s.total_locked += bonus_amount;
            });

            // Start daily reward timer
            start_daily_rewards(caller);

            Ok(block_index)
        }
        Ok(Err(e)) => Err(StakingError::TransferError(e)),
        Err((code, msg)) => Err(StakingError::CanisterCallFailed(code as u32, msg)),
    }
}

#[update]
async fn withdraw() -> Result<Nat, StakingError> {
    let caller = ic_cdk::caller();
    let token_canister_id = TOKEN_CANISTER_ID.with(|id| *id.borrow());

    // Get staker data
    let (total_withdrawable, events_to_remove) = state::mutate_state(|s| {
        let staker_data = match s.stakers.get_mut(&caller) {
            Some(data) => data,
            None => return (Err(StakingError::NotStaking), vec![]),
        };

        let now = time();
        let mut total_withdrawable = Nat::from(0u64);
        let mut events_to_remove = vec![];

        if let Some(events) = s.unlock_events.get_mut(&caller) {
            for (index, event) in events.iter().enumerate() {
                if now >= event.unlock_time {
                    total_withdrawable += event.amount.clone();
                    events_to_remove.push(index);
                }
            }

            // Remove processed events in reverse order
            for index in events_to_remove.iter().rev() {
                events.remove(*index);
            }
        }

        if total_withdrawable == Nat::from(0u64) {
            return (Err(StakingError::LockupPeriodNotEnded), vec![]);
        }

        // Update staker data
        staker_data.active_stake -= total_withdrawable.clone();
        staker_data.pending_unlock -= total_withdrawable.clone();
        staker_data.total_withdrawn += total_withdrawable.clone();

        // Update protocol metrics
        s.total_locked -= total_withdrawable.clone();

        (Ok(total_withdrawable), events_to_remove)
    });

    let total_withdrawable = total_withdrawable?;

    // Transfer tokens back to user
    let client = ICRC1Client {
        runtime: CdkRuntime,
        ledger_canister_id: token_canister_id,
    };

    let subaccount = user_subaccount(caller);
    let transfer_args = TransferArg {
        from_subaccount: Some(subaccount),
        to: caller.into(),
        amount: total_withdrawable.clone(),
        fee: None,
        memo: None,
        created_at_time: None,
    };

    match client.transfer(transfer_args).await {
        Ok(Ok(block_index)) => Ok(block_index),
        Ok(Err(e)) => Err(StakingError::TransferError(e)),
        Err((code, msg)) => Err(StakingError::CanisterCallFailed(code as u32, msg)),
    }
}

#[query]
async fn staking_balance(principal: Principal) -> Result<StakingInfo, StakingError> {
    let (staked_amount, reward_amount, start_time, last_claim_time, unlock_time) = state::read_state(|s| {
        let staker_data = s.stakers.get(&principal).ok_or(StakingError::NotStaking)?;
        let unlock_event = s.unlock_events.get(&principal)
            .and_then(|events| events.first())
            .ok_or(StakingError::NotStaking)?;

        Ok((
            staker_data.active_stake.clone(),
            calculate_rewards(principal, staker_data, s),
            staker_data.last_stake_time,
            unlock_event.created_at,
            unlock_event.unlock_time,
        ))
    })?;

    Ok(StakingInfo {
        staked_amount,
        reward_amount,
        start_time,
        last_claim_time,
        unlock_time,
    })
}

#[query]
async fn my_staking_balance() -> Result<StakingInfo, StakingError> {
    staking_balance(ic_cdk::caller()).await
}

#[update]
async fn subaccount_balance(principal: Principal) -> Result<Nat, StakingError> {
    let token_canister_id = TOKEN_CANISTER_ID.with(|id| *id.borrow());
    let client = ICRC1Client {
        runtime: CdkRuntime,
        ledger_canister_id: token_canister_id,
    };

    let subaccount = user_subaccount(principal);
    let account = Account {
        owner: ic_cdk::id(),
        subaccount: Some(subaccount),
    };

    client.balance_of(account)
        .await
        .map_err(|(code, msg)| StakingError::CanisterCallFailed(code as u32, msg))
}

// Helper functions
fn user_subaccount(principal: Principal) -> [u8; 32] {
    let mut subaccount = [0u8; 32];
    let principal_bytes = principal.as_slice();
    subaccount[..principal_bytes.len()].copy_from_slice(principal_bytes);
    subaccount
}

// Helper functions
#[query]
async fn user_subaccountQ(principal: Principal) -> [u8; 32] {
    let mut subaccount = [0u8; 32];
    let principal_bytes = principal.as_slice();
    subaccount[..principal_bytes.len()].copy_from_slice(principal_bytes);
    subaccount
}

fn calculate_rewards(principal: Principal, staker_data: &StakerData, state: &State) -> Nat {
    let now = time();
    let days_staked = (now - staker_data.last_stake_time) / (24 * 60 * 60 * 1_000_000_000);
    
    // Calculate base rewards using ToPrimitive
    let base_rewards = staker_data.active_stake.0.to_u64().unwrap_or(0) * days_staked * STAKE_REWARD_RATE;
    
    // Add any pending rewards from previous calculations
    let pending_rewards = state.unlock_events.get(&principal)
        .map_or(0, |events| {
            events.iter()
                .filter(|e| e.created_at > staker_data.last_stake_time)
                .map(|e| e.amount.0.to_u64().unwrap_or(0))
                .sum()
        });
    
    Nat::from(base_rewards + pending_rewards)
}

fn start_daily_rewards(principal: Principal) {
    let reward_interval = Duration::from_secs(24 * 60 * 60); // 24 hours

    set_timer(reward_interval, move || {
        ic_cdk::spawn(async move {
            let now = time();
            let reward_amount = state::mutate_state(|s| {
                let staker_data = match s.stakers.get_mut(&principal) {
                    Some(data) => data,
                    None => return Nat::from(0u64),
                };

                // Calculate reward (1 token per staked token per day)
                let reward = staker_data.active_stake.clone() * Nat::from(STAKE_REWARD_RATE) / Nat::from(1u64);
                
                // Update staker's active stake with reward
                staker_data.active_stake += reward.clone();
                staker_data.last_stake_time = now;

                // Create unlock event for the reward
                let unlock_time = now + LOCKUP_PERIOD_NS;
                let tx_index = Nat::from(s.transactions.get(&principal).map_or(0, |v| v.len() as u64)); // Added closing )s                
                s.unlock_events.entry(principal).or_default().push(UnlockEvent {
                    amount: reward.clone(),
                    unlock_time,
                    created_at: now,
                    tx_index,
                });

                // Update protocol metrics
                s.total_staked += reward.clone();
                s.total_locked += reward.clone();

                reward
            });

            if reward_amount > Nat::from(0u64) {
                ic_cdk::println!("Distributed daily reward of {} to {}", reward_amount, principal);
            }

            // Schedule next reward
            start_daily_rewards(principal);
        });
    });
}

#[update]
async fn compound_rewards() -> Result<(), StakingError> {
    let caller = ic_cdk::caller();
    let token_canister_id = TOKEN_CANISTER_ID.with(|id| *id.borrow());

    // Calculate rewards
    let reward_amount = state::read_state(|s| {
        let staker_data = s.stakers.get(&caller).ok_or(StakingError::NotStaking)?;
        Ok(calculate_rewards(caller, staker_data, s))
    })?;

    if reward_amount == Nat::from(0u64) {
        return Err(StakingError::InsufficientBalance);
    }

    // Update state to compound rewards
    state::mutate_state(|s| {
        let staker_data = s.stakers.get_mut(&caller).unwrap();
        staker_data.active_stake += reward_amount.clone();
        staker_data.last_stake_time = time();

        // Create unlock event for the compounded rewards
        let unlock_time = time() + LOCKUP_PERIOD_NS;
        let tx_index = Nat::from(s.transactions.get(&caller).map_or(0, |v| v.len() as u64)); // Added closing )
                
        s.unlock_events.entry(caller).or_default().push(UnlockEvent {
            amount: reward_amount.clone(),
            unlock_time,
            created_at: time(),
            tx_index,
        });

        // Update protocol metrics
        s.total_staked += reward_amount.clone();
        s.total_locked += reward_amount;
    });

    Ok(())
}

#[query]
fn get_protocol_stats() -> ProtocolStats {
    state::read_state(|s| ProtocolStats {
        total_staked: s.total_staked.clone(),
        total_locked: s.total_locked.clone(),
        total_rewards_distributed: s.total_rewards_distributed.clone(),
        total_stakers: s.stakers.len() as u64,
    })
}

#[derive(CandidType, Serialize, Deserialize)]
pub struct ProtocolStats {
    pub total_staked: Nat,
    pub total_locked: Nat,
    pub total_rewards_distributed: Nat,
    pub total_stakers: u64,
}

#[ic_cdk_macros::init]
fn init() {
    // Initialize any necessary state
}

#[ic_cdk_macros::post_upgrade]
fn post_upgrade() {
    // Restart reward timers for all active stakers
    let stakers: Vec<Principal> = state::read_state(|s| s.stakers.keys().cloned().collect());
    for principal in stakers {
        start_daily_rewards(principal);
    }
}

ic_cdk::export_candid!();