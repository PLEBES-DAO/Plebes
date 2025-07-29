// state.rs
use std::collections::{BTreeMap, BTreeSet};
use candid::{CandidType, Nat, Principal};
use serde::{Deserialize, Serialize};
use ic_cdk::api::time;

#[derive(Default, CandidType, Deserialize, Serialize)]
pub struct State {
    // User staking data
    pub stakers: BTreeMap<Principal, StakerData>,
    
    // Transaction history indexed by user
    pub transactions: BTreeMap<Principal, Vec<Nat>>,
    
    // Lockup events
    pub unlock_events: BTreeMap<Principal, Vec<UnlockEvent>>,
    
    // Protocol metrics
    pub total_staked: Nat,
    pub total_locked: Nat,
    pub total_rewards_distributed: Nat,
}

#[derive(CandidType, Deserialize, Serialize, Clone)]
pub struct StakerData {
    pub active_stake: Nat,
    pub pending_unlock: Nat,
    pub total_staked: Nat,
    pub total_withdrawn: Nat,
    pub last_stake_time: u64,
}

#[derive(CandidType, Deserialize, Serialize, Clone)]
pub struct UnlockEvent {
    pub amount: Nat,
    pub unlock_time: u64,  // Timestamp when funds become available
    pub created_at: u64,   // Timestamp when stake was made
    pub tx_index: Nat,     // Index in the transactions array
}

// Thread-local storage for the state
thread_local! {
    pub static STATE: std::cell::RefCell<State> = std::cell::RefCell::new(State::default());
}

// Public interface for state access
pub fn mutate_state<F, R>(f: F) -> R
where
    F: FnOnce(&mut State) -> R,
{
    STATE.with(|s| f(&mut s.borrow_mut()))
}

pub fn read_state<F, R>(f: F) -> R
where
    F: FnOnce(&State) -> R,
{
    STATE.with(|s| f(&s.borrow()))
}

// Staking functions
pub fn stake(principal: Principal, amount: Nat) {
    let now = time();
    let unlock_time = now + 30 * 24 * 60 * 60 * 1_000_000_000; // 30 days in nanoseconds
    
    mutate_state(|s| {
        // Update or create staker data
        let staker_data = s.stakers.entry(principal).or_insert_with(|| StakerData {
            active_stake: Nat::from(0u64),
            pending_unlock: Nat::from(0u64),
            total_staked: Nat::from(0u64),
            total_withdrawn: Nat::from(0u64),
            last_stake_time: now,
        });
        
        // Update staker metrics
        staker_data.active_stake += amount.clone();
        staker_data.total_staked += amount.clone();
        staker_data.last_stake_time = now;
        
        // Add transaction
        let tx_index = Nat::from(s.transactions.entry(principal).or_default().len() as u64);
        s.transactions.entry(principal).or_default().push(amount.clone());
        
        // Create unlock event
        s.unlock_events.entry(principal).or_default().push(UnlockEvent {
            amount: amount.clone(),
            unlock_time,
            created_at: now,
            tx_index,
        });
        
        // Update protocol metrics
        s.total_staked += amount.clone();
        s.total_locked += amount.clone();
    });
}

pub fn withdraw_unlocked(principal: Principal) -> Nat {
    let now = time();
    let mut total_withdrawn = Nat::from(0u64);
    
    mutate_state(|s| {
        if let Some(staker_data) = s.stakers.get_mut(&principal) {
            if let Some(events) = s.unlock_events.get_mut(&principal) {
                let mut to_remove = Vec::new();
                
                // Check all unlock events for this user
                for (index, event) in events.iter().enumerate() {
                    if now >= event.unlock_time {
                        total_withdrawn += event.amount.clone();
                        to_remove.push(index);
                    }
                }
                
                // Remove processed events in reverse order to preserve indices
                for index in to_remove.into_iter().rev() {
                    events.remove(index);
                }
                
                // Update staker data
                staker_data.active_stake -= total_withdrawn.clone();
                staker_data.pending_unlock -= total_withdrawn.clone();
                staker_data.total_withdrawn += total_withdrawn.clone();
                
                // Update protocol metrics
                s.total_locked -= total_withdrawn.clone();
            }
        }
    });
    
    total_withdrawn
}

// Query functions
pub fn get_staker_data(principal: &Principal) -> Option<StakerData> {
    read_state(|s| s.stakers.get(principal).cloned())
}

pub fn get_transactions(principal: &Principal) -> Vec<Nat> {
    read_state(|s| s.transactions.get(principal).cloned().unwrap_or_default())
}

pub fn get_pending_unlock_events(principal: &Principal) -> Vec<UnlockEvent> {
    read_state(|s| {
        s.unlock_events.get(principal)
            .map(|events| events.iter()
                .filter(|e| time() < e.unlock_time)
                .cloned()
                .collect())
            .unwrap_or_default()
    })
}

pub fn get_ready_to_unlock_events(principal: &Principal) -> Vec<UnlockEvent> {
    read_state(|s| {
        s.unlock_events.get(principal)
            .map(|events| events.iter()
                .filter(|e| time() >= e.unlock_time)
                .cloned()
                .collect())
            .unwrap_or_default()
    })
}

pub fn get_protocol_stats() -> ProtocolStats {
    read_state(|s| ProtocolStats {
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