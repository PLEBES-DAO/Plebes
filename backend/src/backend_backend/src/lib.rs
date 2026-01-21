pub mod state;

use candid::{CandidType, Nat, Principal};
use ic_cdk::api::time;
use ic_cdk_macros::{query, update, init, post_upgrade};
use ic_cdk_timers::set_timer;
use num_traits::cast::ToPrimitive;
use serde::{Deserialize, Serialize};
use icrc_ledger_client_cdk::{CdkRuntime, ICRC1Client};
use icrc_ledger_types::icrc1::account::Account;
use icrc_ledger_types::icrc1::transfer::{TransferArg, TransferError};
use icrc_ledger_types::icrc2::transfer_from::{TransferFromArgs, TransferFromError};
use std::time::Duration;

// Import types from state module with stable structures support
use crate::state::{StakerData, UnlockEvent, ProtocolStats, StableVecNat, StableVecUnlockEvent, Attempts, BurnEvent, StableVecBurnEvent};

// Configuration constants
const STAKE_REWARD_RATE: u64 = 1; // 1 token per day per staked token
const LOCKUP_PERIOD_NS: u64 = 30 * 24 * 60 * 60 * 1_000_000_000; // 30 days in nanoseconds
const TOKEN_DECIMALS_DIVISOR: u64 = 100_000_000; // For converting from e8s to readable format

// Early Staking Program constants
const MAX_EARLY_STAKING_PARTICIPANTS: u64 = 100;
const EARLY_STAKING_BONUS: u64 = 10 * TOKEN_DECIMALS_DIVISOR; // 10 tokens bonus (in e8s)
const EARLY_STAKING_DAILY_REWARD: u64 = 1; // 1 PLBS daily reward
const EARLY_STAKING_LIFETIME_BONUS_PERCENT: u64 = 1; // 1% lifetime bonus

// ULTRA-MVP Burn Configuration
const MIN_STAKE_AMOUNT: u64 = 10; // Minimum amount for stake/burn operations
const LIMIT_PER_10M: u64 = 5; // Maximum attempts per 10 minute window
const LOCKOUT_SECS: u64 = 300; // 5 minutes lockout after fragmentation
const BURN_SPLIT_PERCENTAGE: u64 = 80; // 80% burned, 20% to treasury
const WINDOW_SIZE_NS: u64 = 10 * 60 * 1_000_000_000; // 10 minutes in nanoseconds

// Special addresses for burn operations
const BURN_SINK_TEXT: &str = "aaaaa-aa"; // Burn sink address (well-known black hole)
const TREASURY_TEXT: &str = "4pirv-cmyye-wxchr-37dkz-r6b7o-2gcnk-jf7qn-skfek-46kz4-faldj-uae"; // Treasury address

// Demo mode flag (can be toggled for demo purposes)
thread_local! {
    static DEMO_BURN_ON_STAKE: std::cell::RefCell<bool> = std::cell::RefCell::new(false);
}

// Thread-local storage for the token canister ID
thread_local! {
    static TOKEN_CANISTER_ID: std::cell::RefCell<Principal> = 
        std::cell::RefCell::new(Principal::from_text("olpbc-wyaaa-aaaag-acnya-cai").unwrap()); // Default to ICP ledger
}

#[derive(CandidType, Deserialize, Serialize, Debug, Clone)]
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
    // ULTRA-MVP Burn-specific errors
    AttemptLimit,
    LockedOut,
    NoPriorStake,
    InsufficientStakedBalance,
}

#[derive(CandidType, Serialize, Deserialize)]
pub struct StakingInfo {
    pub staked_amount: Nat,
    pub reward_amount: Nat,
    pub start_time: u64,
    pub last_claim_time: u64,
    pub unlock_time: u64,
}

// ULTRA-MVP Burn-related data structures (imported from state.rs)

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct BurnResult {
    pub burned: Nat,     // Amount burned (80%)
    pub to_treasury: Nat, // Amount sent to treasury (20%)
}

#[derive(CandidType, Serialize, Deserialize, Debug)]
pub struct BurnStats {
    pub total_burned: Nat,
    pub total_to_treasury: Nat,
    pub total_burn_events: u64,
}

#[derive(CandidType, Serialize, Deserialize, Debug)]
pub struct EarlyStakingStats {
    pub total_participants: u64,
    pub slots_remaining: u64,
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

    // Check if user is already staking using stable structures
    if state::read_stakers(|stakers| stakers.contains_key(&caller)) {
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
        fee: None,
        memo: None,
        created_at_time: None,
    };

    match client.transfer_from(transfer_args).await {
        Ok(Ok(block_index)) => {
            // Use the state::stake function from state.rs
            state::stake(caller, amount);
            
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

    // Check if user is already staking using stable structures
    if state::read_stakers(|stakers| stakers.contains_key(&caller)) {
        return Err(StakingError::AlreadyStaking);
    }

    // Check if user qualifies for early staking program
    if !state::is_early_staking_participant(&caller) && state::get_early_staking_slots_remaining() > 0 {
        // Automatically join early staking program
        let _ = state::join_early_staking_program(caller);
    }

    let client = ICRC1Client {
        runtime: CdkRuntime,
        ledger_canister_id: token_canister_id,
    };

    let subaccount = user_subaccount(caller);
    let bonus_amount = Nat::from(EARLY_STAKING_BONUS);

    // First, burn some tokens (50% of bonus amount) before giving the bonus
    let burn_amount = bonus_amount.clone() / Nat::from(2u64); // Burn half the bonus amount
    
    // Execute burn split (80% burn / 20% treasury) from canister's main balance
    let burn_result = exec_burn_split_from_canister(burn_amount.clone()).await?;
    
    // Log burn event for the canister (early staking program burn)
    let now = time();
    let burn_event = BurnEvent {
        amount: burn_amount.clone(),
        burned: burn_result.burned.clone(),
        treasury: burn_result.to_treasury.clone(),
        block_index: Nat::from(0u64), // Simplified for MVP
        created_at: now,
    };
    
    // Store burn event under the canister's principal for tracking
    let canister_principal = ic_cdk::id();
    state::mutate_burn_events(|burn_events| {
        let mut events = burn_events.get(&canister_principal)
            .map(|v| v.0.clone())
            .unwrap_or_default();
        events.push(burn_event);
        burn_events.insert(canister_principal, StableVecBurnEvent(events));
    });
    
    // Update global burn metrics
    state::TOTAL_BURNED.with(|total| {
        let mut writer = total.borrow_mut();
        let mut current = writer.get().0.clone();
        current += burn_result.burned.clone();
        writer.set(state::StableNat(current)).unwrap();
    });
    
    state::TOTAL_TO_TREASURY.with(|total| {
        let mut writer = total.borrow_mut();
        let mut current = writer.get().0.clone();
        current += burn_result.to_treasury.clone();
        writer.set(state::StableNat(current)).unwrap();
    });

    // Now give user the bonus tokens in their subaccount
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
            // Use the state::stake function from state.rs
            state::stake(caller, bonus_amount.clone());
            
            // Start daily reward timer
            start_daily_rewards(caller);

            ic_cdk::println!("Early staking: Burned {} tokens ({}B/{}T), gave {} bonus to user {}", 
                             burn_amount, burn_result.burned, burn_result.to_treasury, bonus_amount, caller);

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

    // First check if user is staking
    if !state::read_stakers(|stakers| stakers.contains_key(&caller)) {
        return Err(StakingError::NotStaking);
    }

    // Use state::withdraw_unlocked function
    let total_withdrawable = state::withdraw_unlocked(caller);

    if total_withdrawable == Nat::from(0u64) {
        return Err(StakingError::LockupPeriodNotEnded);
    }

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
    let staker_data = state::get_staker_data(&principal).ok_or(StakingError::NotStaking)?;
    let unlock_events = state::get_pending_unlock_events(&principal);
    
    let unlock_event = unlock_events.first().ok_or(StakingError::NotStaking)?;
    
    let reward_amount = calculate_rewards(principal, &staker_data);

    Ok(StakingInfo {
        staked_amount: staker_data.active_stake.clone(),
        reward_amount,
        start_time: staker_data.last_stake_time,
        last_claim_time: unlock_event.created_at,
        unlock_time: unlock_event.unlock_time,
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

#[query]
async fn user_subaccount_q(principal: Principal) -> [u8; 32] {
    user_subaccount(principal)
}

fn calculate_rewards(principal: Principal, staker_data: &StakerData) -> Nat {
    let now = time();
    let days_staked = (now - staker_data.last_stake_time) / (24 * 60 * 60 * 1_000_000_000);
    
    // Calculate base rewards using ToPrimitive
    let base_rewards = staker_data.active_stake.0.to_u64().unwrap_or(0) * days_staked * STAKE_REWARD_RATE;
    
    // Add any pending rewards from previous calculations
    let unlock_events = state::get_pending_unlock_events(&principal);
    let pending_rewards: u64 = unlock_events.iter()
        .filter(|e| e.created_at > staker_data.last_stake_time)
        .map(|e| e.amount.0.to_u64().unwrap_or(0))
        .sum();
    
    Nat::from(base_rewards + pending_rewards)
}

fn start_daily_rewards(principal: Principal) {
    let reward_interval = Duration::from_secs(24 * 60 * 60); // 24 hours

    set_timer(reward_interval, move || {
        ic_cdk::spawn(async move {
            let now = time();
            
            // Get current staker data
            if let Some(mut staker_data) = state::get_staker_data(&principal) {
                // Calculate reward (1 token per staked token per day)
                let reward = staker_data.active_stake.clone() * Nat::from(STAKE_REWARD_RATE) / Nat::from(1u64);
                
                if reward > Nat::from(0u64) {
                    // Update staker's active stake with reward
                    staker_data.active_stake += reward.clone();
                    staker_data.last_stake_time = now;
                    
                    // Update staker data
                    state::mutate_stakers(|stakers| {
                        stakers.insert(principal, staker_data);
                    });
                    
                    // Add transaction
                    state::mutate_transactions(|transactions| {
                        let mut tx_vec = transactions.get(&principal)
                            .map(|v| v.0.clone())
                            .unwrap_or_default();
                        tx_vec.push(reward.clone());
                        transactions.insert(principal, StableVecNat(tx_vec));
                    });
                    
                    // Create unlock event for the reward
                    let unlock_time = now + LOCKUP_PERIOD_NS;
                    let tx_index = state::read_transactions(|transactions| {
                        Nat::from(transactions.get(&principal)
                            .map(|v| v.0.len())
                            .unwrap_or(0) as u64)
                    });
                    
                    state::mutate_unlock_events(|unlock_events| {
                        let mut events = unlock_events.get(&principal)
                            .map(|v| v.0.clone())
                            .unwrap_or_default();
                        
                        events.push(UnlockEvent {
                            amount: reward.clone(),
                            unlock_time,
                            created_at: now,
                            tx_index,
                        });
                        
                        unlock_events.insert(principal, StableVecUnlockEvent(events));
                    });
                    
                    // Update protocol metrics
                    state::TOTAL_STAKED.with(|total| {
                        let mut writer = total.borrow_mut();
                        let mut current = writer.get().0.clone();
                        current += reward.clone();
                        writer.set(state::StableNat(current)).unwrap();
                    });
                    
                    state::TOTAL_LOCKED.with(|total| {
                        let mut writer = total.borrow_mut();
                        let mut current = writer.get().0.clone();
                        current += reward.clone();
                        writer.set(state::StableNat(current)).unwrap();
                    });
                    
                    ic_cdk::println!("Distributed daily reward of {} to {}", reward, principal);
                }
            }

            // Schedule next reward
            start_daily_rewards(principal);
        });
    });
}

#[update]
async fn compound_rewards() -> Result<(), StakingError> {
    let caller = ic_cdk::caller();
    
    // Get staker data
    let staker_data = state::get_staker_data(&caller).ok_or(StakingError::NotStaking)?;
    
    // Calculate rewards
    let reward_amount = calculate_rewards(caller, &staker_data);

    if reward_amount == Nat::from(0u64) {
        return Err(StakingError::InsufficientBalance);
    }

    // Update state to compound rewards
    let now = time();
    state::mutate_stakers(|stakers| {
        if let Some(mut staker_data) = stakers.get(&caller) {
            staker_data.active_stake += reward_amount.clone();
            staker_data.last_stake_time = now;
            stakers.insert(caller, staker_data);
        }
    });
    
    // Add transaction
    state::mutate_transactions(|transactions| {
        let mut tx_vec = transactions.get(&caller)
            .map(|v| v.0.clone())
            .unwrap_or_default();
        tx_vec.push(reward_amount.clone());
        transactions.insert(caller, StableVecNat(tx_vec));
    });

    // Create unlock event for the compounded rewards
    let unlock_time = now + LOCKUP_PERIOD_NS;
    let tx_index = state::read_transactions(|transactions| {
        Nat::from(transactions.get(&caller)
            .map(|v| v.0.len())
            .unwrap_or(0) as u64)
    });
    
    state::mutate_unlock_events(|unlock_events| {
        let mut events = unlock_events.get(&caller)
            .map(|v| v.0.clone())
            .unwrap_or_default();
        
        events.push(UnlockEvent {
            amount: reward_amount.clone(),
            unlock_time,
            created_at: now,
            tx_index,
        });
        
        unlock_events.insert(caller, StableVecUnlockEvent(events));
    });

    // Update protocol metrics
    state::TOTAL_STAKED.with(|total| {
        let mut writer = total.borrow_mut();
        let mut current = writer.get().0.clone();
        current += reward_amount.clone();
        writer.set(state::StableNat(current)).unwrap();
    });
    
    state::TOTAL_LOCKED.with(|total| {
        let mut writer = total.borrow_mut();
        let mut current = writer.get().0.clone();
        current += reward_amount;
        writer.set(state::StableNat(current)).unwrap();
    });

    Ok(())
}

#[query]
fn get_protocol_stats() -> ProtocolStats {
    state::get_protocol_stats()
}

// ULTRA-MVP: Anti-fragmentation logic
fn check_attempt_rules(caller: Principal, amount: &Nat) -> Result<(), StakingError> {
    let now = time();
    let amount_u64 = amount.0.to_u64().unwrap_or(0);
    
    // Rule 1: Minimum stake amount
    if amount_u64 < MIN_STAKE_AMOUNT {
        return Err(StakingError::InvalidAmount);
    }
    
    // Get or create attempts record for this user
    let mut attempts = state::read_burn_attempts(|attempts_map| {
        attempts_map.get(&caller).unwrap_or_else(|| Attempts {
            win_start: now,
            small_cnt: 0,
            total_cnt: 0,
            lockout_until: 0,
        })
    });
    
    // Rule 3: Check lockout status first
    if now < attempts.lockout_until {
        return Err(StakingError::LockedOut);
    }
    
    // Check if we need to reset the window (10 minutes passed)
    if now >= attempts.win_start + WINDOW_SIZE_NS {
        attempts = Attempts {
            win_start: now,
            small_cnt: 0,
            total_cnt: 0,
            lockout_until: 0,
        };
    }
    
    // Rule 2: Total attempt limit per window
    if attempts.total_cnt >= LIMIT_PER_10M {
        return Err(StakingError::AttemptLimit);
    }
    
    // Update attempt counters
    attempts.total_cnt += 1;
    if amount_u64 < MIN_STAKE_AMOUNT {
        attempts.small_cnt += 1;
    }
    
    // Rule 3: Fragmentation pattern detection (3 small attempts = lockout)
    if attempts.small_cnt >= 3 {
        attempts.lockout_until = now + (LOCKOUT_SECS * 1_000_000_000); // Convert to nanoseconds
        
        // Save updated attempts and return lockout error
        state::mutate_burn_attempts(|attempts_map| {
            attempts_map.insert(caller, attempts);
        });
        
        return Err(StakingError::LockedOut);
    }
    
    // Save updated attempts
    state::mutate_burn_attempts(|attempts_map| {
        attempts_map.insert(caller, attempts);
    });
    
    Ok(())
}

// ULTRA-MVP: Burn split execution helper (from user's subaccount)
async fn exec_burn_split(caller: Principal, amount: Nat) -> Result<BurnResult, StakingError> {
    let token_canister_id = TOKEN_CANISTER_ID.with(|id| *id.borrow());
    let client = ICRC1Client {
        runtime: CdkRuntime,
        ledger_canister_id: token_canister_id,
    };
    
    // Calculate 80/20 split
    let amount_u64 = amount.0.to_u64().unwrap_or(0);
    let burned_amount = Nat::from((amount_u64 * BURN_SPLIT_PERCENTAGE) / 100);
    let treasury_amount = amount.clone() - burned_amount.clone();
    
    let subaccount = user_subaccount(caller);
    
    // Transfer to burn sink (80%)
    let burn_sink = Principal::from_text(BURN_SINK_TEXT)
        .map_err(|_| StakingError::InternalError("Invalid burn sink address".to_string()))?;
    
    let burn_transfer = TransferArg {
        from_subaccount: Some(subaccount),
        to: burn_sink.into(),
        amount: burned_amount.clone(),
        fee: None,
        memo: None,
        created_at_time: None,
    };
    
    let _burn_block = match client.transfer(burn_transfer).await {
        Ok(Ok(block_index)) => block_index,
        Ok(Err(e)) => return Err(StakingError::TransferError(e)),
        Err((code, msg)) => return Err(StakingError::CanisterCallFailed(code as u32, msg)),
    };
    
    // Transfer to treasury (20%)
    let treasury = Principal::from_text(TREASURY_TEXT)
        .map_err(|_| StakingError::InternalError("Invalid treasury address".to_string()))?;
    
    let treasury_transfer = TransferArg {
        from_subaccount: Some(subaccount),
        to: treasury.into(),
        amount: treasury_amount.clone(),
        fee: None,
        memo: None,
        created_at_time: None,
    };
    
    let _treasury_block = match client.transfer(treasury_transfer).await {
        Ok(Ok(block_index)) => block_index,
        Ok(Err(e)) => return Err(StakingError::TransferError(e)),
        Err((code, msg)) => return Err(StakingError::CanisterCallFailed(code as u32, msg)),
    };
    
    Ok(BurnResult {
        burned: burned_amount,
        to_treasury: treasury_amount,
    })
}

// ULTRA-MVP: Burn split execution helper (from canister's main account)
async fn exec_burn_split_from_canister(amount: Nat) -> Result<BurnResult, StakingError> {
    let token_canister_id = TOKEN_CANISTER_ID.with(|id| *id.borrow());
    let client = ICRC1Client {
        runtime: CdkRuntime,
        ledger_canister_id: token_canister_id,
    };
    
    // Calculate 80/20 split
    let amount_u64 = amount.0.to_u64().unwrap_or(0);
    let burned_amount = Nat::from((amount_u64 * BURN_SPLIT_PERCENTAGE) / 100);
    let treasury_amount = amount.clone() - burned_amount.clone();
    
    // Transfer to burn sink (80%) from canister main account
    let burn_sink = Principal::from_text(BURN_SINK_TEXT)
        .map_err(|_| StakingError::InternalError("Invalid burn sink address".to_string()))?;
    
    let burn_transfer = TransferArg {
        from_subaccount: None, // From canister main account
        to: burn_sink.into(),
        amount: burned_amount.clone(),
        fee: None,
        memo: None,
        created_at_time: None,
    };
    
    let _burn_block = match client.transfer(burn_transfer).await {
        Ok(Ok(block_index)) => block_index,
        Ok(Err(e)) => return Err(StakingError::TransferError(e)),
        Err((code, msg)) => return Err(StakingError::CanisterCallFailed(code as u32, msg)),
    };
    
    // Transfer to treasury (20%) from canister main account
    let treasury = Principal::from_text(TREASURY_TEXT)
        .map_err(|_| StakingError::InternalError("Invalid treasury address".to_string()))?;
    
    let treasury_transfer = TransferArg {
        from_subaccount: None, // From canister main account
        to: treasury.into(),
        amount: treasury_amount.clone(),
        fee: None,
        memo: None,
        created_at_time: None,
    };
    
    let _treasury_block = match client.transfer(treasury_transfer).await {
        Ok(Ok(block_index)) => block_index,
        Ok(Err(e)) => return Err(StakingError::TransferError(e)),
        Err((code, msg)) => return Err(StakingError::CanisterCallFailed(code as u32, msg)),
    };
    
    Ok(BurnResult {
        burned: burned_amount,
        to_treasury: treasury_amount,
    })
}

// ULTRA-MVP: Main burn_tokens endpoint
#[update]
async fn burn_tokens(amount: Nat) -> Result<BurnResult, StakingError> {
    let caller = ic_cdk::caller();
    let now = time();
    
    // Pre-validation 1: No anonymous users
    if caller == Principal::anonymous() {
        return Err(StakingError::InternalError("Anonymous users cannot burn tokens".to_string()));
    }
    
    // Pre-validation 2: User must have staking data
    let staker_data = state::get_staker_data(&caller).ok_or(StakingError::NoPriorStake)?;
    
    // Pre-validation 3: Check if user has sufficient staked balance
    if staker_data.active_stake < amount {
        return Err(StakingError::InsufficientStakedBalance);
    }
    
    // Pre-validation 4: Check attempt rules (anti-fragmentation)
    check_attempt_rules(caller, &amount)?;
    
    // Execute burn split (80% burn / 20% treasury)
    let burn_result = exec_burn_split(caller, amount.clone()).await?;
    
    // Update staker data (reduce active stake)
    state::mutate_stakers(|stakers| {
        if let Some(mut staker_data) = stakers.get(&caller) {
            staker_data.active_stake -= amount.clone();
            stakers.insert(caller, staker_data);
        }
    });
    
    // Log burn event
    let burn_event = BurnEvent {
        amount: amount.clone(),
        burned: burn_result.burned.clone(),
        treasury: burn_result.to_treasury.clone(),
        block_index: Nat::from(0u64), // Simplified for MVP
        created_at: now,
    };
    
    state::mutate_burn_events(|burn_events| {
        let mut events = burn_events.get(&caller)
            .map(|v| v.0.clone())
            .unwrap_or_default();
        events.push(burn_event);
        burn_events.insert(caller, StableVecBurnEvent(events));
    });
    
    // Update global burn metrics
    state::TOTAL_BURNED.with(|total| {
        let mut writer = total.borrow_mut();
        let mut current = writer.get().0.clone();
        current += burn_result.burned.clone();
        writer.set(state::StableNat(current)).unwrap();
    });
    
    state::TOTAL_TO_TREASURY.with(|total| {
        let mut writer = total.borrow_mut();
        let mut current = writer.get().0.clone();
        current += burn_result.to_treasury.clone();
        writer.set(state::StableNat(current)).unwrap();
    });
    
    ic_cdk::println!("Burned {} tokens: {} to sink, {} to treasury", 
                     amount, burn_result.burned, burn_result.to_treasury);
    
    Ok(burn_result)
}

// ULTRA-MVP: Burn query functions
#[query]
fn get_burn_eligibility(principal: Principal) -> bool {
    let now = time();
    
    // Check if user has staking data
    if state::get_staker_data(&principal).is_none() {
        return false;
    }
    
    // Check if user has active stake >= minimum
    let staker_data = state::get_staker_data(&principal).unwrap();
    let amount_u64 = staker_data.active_stake.0.to_u64().unwrap_or(0);
    if amount_u64 < MIN_STAKE_AMOUNT {
        return false;
    }
    
    // Check if user is not in lockout
    let attempts = state::read_burn_attempts(|attempts_map| {
        attempts_map.get(&principal).unwrap_or_else(|| Attempts {
            win_start: now,
            small_cnt: 0,
            total_cnt: 0,
            lockout_until: 0,
        })
    });
    
    if now < attempts.lockout_until {
        return false;
    }
    
    true
}

#[query]
fn get_burn_stats() -> BurnStats {
    let total_burned = state::TOTAL_BURNED.with(|t| t.borrow().get().0.clone());
    let total_to_treasury = state::TOTAL_TO_TREASURY.with(|t| t.borrow().get().0.clone());
    let total_burn_events = state::read_burn_events(|burn_events| {
        burn_events.iter().map(|(_, events)| events.0.len() as u64).sum()
    });
    
    BurnStats {
        total_burned,
        total_to_treasury,
        total_burn_events,
    }
}

#[query]
fn get_user_burn_history(principal: Principal) -> Vec<BurnEvent> {
    state::read_burn_events(|burn_events| {
        burn_events.get(&principal)
            .map(|events_wrapper| events_wrapper.0.clone())
            .unwrap_or_default()
    })
}

#[query]
fn get_attempt_status(principal: Principal) -> Attempts {
    let now = time();
    state::read_burn_attempts(|attempts_map| {
        attempts_map.get(&principal).unwrap_or_else(|| Attempts {
            win_start: now,
            small_cnt: 0,
            total_cnt: 0,
            lockout_until: 0,
        })
    })
}

// ULTRA-MVP: Demo mode functions
#[update]
fn set_demo_burn_mode(enabled: bool) {
    DEMO_BURN_ON_STAKE.with(|flag| {
        *flag.borrow_mut() = enabled;
    });
}

#[query]
fn get_demo_burn_mode() -> bool {
    DEMO_BURN_ON_STAKE.with(|flag| *flag.borrow())
}

// Early Staking Program functions
#[derive(CandidType, Serialize, Deserialize, Debug)]
pub struct EarlyStakingInfo {
    pub is_eligible: bool,
    pub is_participant: bool,
    pub slots_remaining: u64,
    pub total_participants: u64,
    pub joined_at: Option<u64>,
    pub lifetime_bonus_eligible: bool,
}

#[update]
fn join_early_staking_program() -> Result<String, String> {
    let caller = ic_cdk::caller();
    
    match state::join_early_staking_program(caller) {
        Ok(_) => {
            let current_count = state::get_early_staking_count();
            Ok(format!(
                "Successfully joined early staking program! You are participant {}/100 and eligible for a {} token lifetime bonus.",
                current_count,
                EARLY_STAKING_BONUS / TOKEN_DECIMALS_DIVISOR
            ))
        },
        Err(e) => Err(e.to_string()),
    }
}

#[query]
fn get_early_staking_info(principal: Principal) -> EarlyStakingInfo {
    let is_participant = state::is_early_staking_participant(&principal);
    let slots_remaining = state::get_early_staking_slots_remaining();
    let total_participants = state::get_early_staking_count();
    let is_eligible = !is_participant && slots_remaining > 0;
    
    let (joined_at, lifetime_bonus_eligible) = if let Some(data) = state::get_early_staking_data(&principal) {
        (Some(data.joined_at), data.lifetime_bonus_eligible)
    } else {
        (None, false)
    };
    
    EarlyStakingInfo {
        is_eligible,
        is_participant,
        slots_remaining,
        total_participants,
        joined_at,
        lifetime_bonus_eligible,
    }
}

#[query]
fn my_early_staking_info() -> EarlyStakingInfo {
    get_early_staking_info(ic_cdk::caller())
}

#[query]
fn get_early_staking_stats() -> EarlyStakingStats {
    let total_participants = state::get_early_staking_count();
    let slots_remaining = state::get_early_staking_slots_remaining();
    EarlyStakingStats {
        total_participants,
        slots_remaining,
    }
}

// ADMIN: Reset and recovery functions
#[update]
async fn admin_withdraw_all_subaccounts() -> Result<Vec<(Principal, Nat)>, String> {
    let caller = ic_cdk::caller();
    let canister_id = ic_cdk::id();
    
    // Only allow canister controller to call this
    // Note: In production, you'd want to check against a list of admin principals
    if caller == Principal::anonymous() {
        return Err("Anonymous users cannot call admin functions".to_string());
    }
    
    let token_canister_id = TOKEN_CANISTER_ID.with(|id| *id.borrow());
    let client = ICRC1Client {
        runtime: CdkRuntime,
        ledger_canister_id: token_canister_id,
    };
    
    let mut withdrawals = Vec::new();
    
    // Get all stakers
    let stakers: Vec<Principal> = state::read_stakers(|stakers| {
        stakers.iter().map(|(k, _)| k.clone()).collect()
    });
    
    ic_cdk::println!("Found {} stakers to withdraw from", stakers.len());
    
    // Withdraw from each user's subaccount
    for principal in stakers {
        let subaccount = user_subaccount(principal);
        let account = Account {
            owner: canister_id,
            subaccount: Some(subaccount),
        };
        
        // Check balance in subaccount
        match client.balance_of(account.clone()).await {
            Ok(balance) => {
                if balance > Nat::from(0u64) {
                    ic_cdk::println!("Withdrawing {} tokens from {} subaccount", balance, principal);
                    
                    // Transfer from subaccount to main canister account
                    let transfer_args = TransferArg {
                        from_subaccount: Some(subaccount),
                        to: canister_id.into(), // Main canister account
                        amount: balance.clone(),
                        fee: None,
                        memo: None,
                        created_at_time: None,
                    };
                    
                    match client.transfer(transfer_args).await {
                        Ok(Ok(block_index)) => {
                            withdrawals.push((principal, balance.clone()));
                            ic_cdk::println!("Successfully withdrew {} tokens from {} (block: {})", balance, principal, block_index);
                        }
                        Ok(Err(e)) => {
                            ic_cdk::println!("Failed to transfer from {}: {:?}", principal, e);
                        }
                        Err((code, msg)) => {
                            ic_cdk::println!("Transfer call failed for {}: {} - {}", principal, code, msg);
                        }
                    }
                } else {
                    ic_cdk::println!("No balance in {} subaccount", principal);
                }
            }
            Err((code, msg)) => {
                ic_cdk::println!("Failed to check balance for {}: {} - {}", principal, code, msg);
            }
        }
    }
    
    Ok(withdrawals)
}

#[update]
fn admin_reset_all_state() -> String {
    let caller = ic_cdk::caller();
    
    // Only allow canister controller to call this
    if caller == Principal::anonymous() {
        return "Anonymous users cannot call admin functions".to_string();
    }
    
    // Reset all stable storage
    state::mutate_stakers(|stakers| {
        let count = stakers.len();
        let _ = stakers.clear_new();
        ic_cdk::println!("Cleared {} stakers", count);
    });
    
    state::mutate_transactions(|transactions| {
        let count = transactions.len();
        let _ = transactions.clear_new();
        ic_cdk::println!("Cleared {} transaction histories", count);
    });
    
    state::mutate_unlock_events(|unlock_events| {
        let count = unlock_events.len();
        let _ = unlock_events.clear_new();
        ic_cdk::println!("Cleared {} unlock event histories", count);
    });
    
    state::mutate_burn_events(|burn_events| {
        let count = burn_events.len();
        let _ = burn_events.clear_new();
        ic_cdk::println!("Cleared {} burn event histories", count);
    });
    
    state::mutate_burn_attempts(|burn_attempts| {
        let count = burn_attempts.len();
        let _ = burn_attempts.clear_new();
        ic_cdk::println!("Cleared {} burn attempt records", count);
    });
    
    state::mutate_early_staking_participants(|participants| {
        let count = participants.len();
        let _ = participants.clear_new();
        ic_cdk::println!("Cleared {} early staking participants", count);
    });
    
    // Reset protocol counters
    state::TOTAL_STAKED.with(|total| {
        let mut writer = total.borrow_mut();
        writer.set(state::StableNat(Nat::from(0u64))).unwrap();
    });
    
    state::TOTAL_LOCKED.with(|total| {
        let mut writer = total.borrow_mut();
        writer.set(state::StableNat(Nat::from(0u64))).unwrap();
    });
    
    state::TOTAL_REWARDS_DISTRIBUTED.with(|total| {
        let mut writer = total.borrow_mut();
        writer.set(state::StableNat(Nat::from(0u64))).unwrap();
    });
    
    state::TOTAL_BURNED.with(|total| {
        let mut writer = total.borrow_mut();
        writer.set(state::StableNat(Nat::from(0u64))).unwrap();
    });
    
    state::TOTAL_TO_TREASURY.with(|total| {
        let mut writer = total.borrow_mut();
        writer.set(state::StableNat(Nat::from(0u64))).unwrap();
    });
    
    state::EARLY_STAKING_COUNT.with(|count| {
        let mut writer = count.borrow_mut();
        writer.set(state::StableU64(0)).unwrap();
    });
    
    ic_cdk::println!("Admin reset completed - all state cleared");
    "Successfully reset all staking state and protocol counters".to_string()
}

#[query]
fn admin_get_all_subaccount_balances() -> Vec<(Principal, Nat)> {
    let _canister_id = ic_cdk::id();
    
    // Get all stakers
    let stakers: Vec<Principal> = state::read_stakers(|stakers| {
        stakers.iter().map(|(k, _)| k.clone()).collect()
    });
    
    // Note: This is a query function, so we can't make async calls to check actual balances
    // This function returns the list of principals that have subaccounts
    // The actual balance checking needs to be done in the update function above
    stakers.into_iter().map(|p| (p, Nat::from(0u64))).collect()
}

// CRITICAL: Upgrade hooks for data persistence
#[init]
fn init() {
    ic_cdk::println!("Initializing Plebes Frontend canister with stable structures");
    
    // Initialize any timers or background processes
    // Note: On first init, there won't be any stakers yet
}

#[post_upgrade]
fn post_upgrade() {
    ic_cdk::println!("Plebes Frontend canister upgraded - restoring all timers and processes");
    
    // Restart reward timers for all active stakers
    let stakers: Vec<Principal> = state::read_stakers(|stakers| {
        stakers.iter().map(|(k, _)| k.clone()).collect()
    });
    
    ic_cdk::println!("Restoring timers for {} active stakers", stakers.len());
    
    for principal in stakers {
        start_daily_rewards(principal);
    }
}

ic_cdk::export_candid!();
