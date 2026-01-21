// state.rs - Migrated to stable structures for data persistence across upgrades
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    storable::Bound,
    BTreeMap as StableBTreeMap,
    Cell,
    DefaultMemoryImpl,
    Storable
};
use std::cell::RefCell;
use std::borrow::Cow;
use candid::{CandidType, Nat, Principal};
use serde::{Deserialize, Serialize};
use ic_cdk::api::time;
use num_bigint::BigUint;

type Memory = VirtualMemory<DefaultMemoryImpl>;

// Memory ID enum to keep track of memory assignments
#[derive(Clone, Copy, Debug)]
pub enum StableStorageId {
    Stakers,                // 1
    Transactions,           // 2
    UnlockEvents,           // 3
    TotalStaked,            // 4
    TotalLocked,            // 5
    TotalRewardsDistributed, // 6
    // ULTRA-MVP Burn-related storage
    BurnAttempts,           // 7
    BurnEvents,             // 8
    TotalBurned,            // 9
    TotalToTreasury,        // 10
    // Early Staking Program storage
    EarlyStakingParticipants, // 11
    EarlyStakingCount,      // 12
}

impl StableStorageId {
    pub fn id(&self) -> u8 {
        match self {
            StableStorageId::Stakers => 1,
            StableStorageId::Transactions => 2,
            StableStorageId::UnlockEvents => 3,
            StableStorageId::TotalStaked => 4,
            StableStorageId::TotalLocked => 5,
            StableStorageId::TotalRewardsDistributed => 6,
            StableStorageId::BurnAttempts => 7,
            StableStorageId::BurnEvents => 8,
            StableStorageId::TotalBurned => 9,
            StableStorageId::TotalToTreasury => 10,
            StableStorageId::EarlyStakingParticipants => 11,
            StableStorageId::EarlyStakingCount => 12,
        }
    }
}

// Stable wrapper for Nat
#[derive(CandidType, Clone)]
pub struct StableNat(pub Nat);

impl Storable for StableNat {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(self.0.0.to_bytes_le())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        StableNat(Nat(BigUint::from_bytes_le(&bytes)))
    }

    const BOUND: Bound = Bound::Unbounded;
}

// Original data structures with Storable implementations
#[derive(CandidType, Deserialize, Serialize, Clone)]
pub struct StakerData {
    pub active_stake: Nat,
    pub pending_unlock: Nat,
    pub total_staked: Nat,
    pub total_withdrawn: Nat,
    pub last_stake_time: u64,
}

impl Storable for StakerData {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

#[derive(CandidType, Deserialize, Serialize, Clone)]
pub struct UnlockEvent {
    pub amount: Nat,
    pub unlock_time: u64,  // Timestamp when funds become available
    pub created_at: u64,   // Timestamp when stake was made
    pub tx_index: Nat,     // Index in the transactions array
}

impl Storable for UnlockEvent {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

// Stable wrapper for Vec<Nat> (transactions)
#[derive(CandidType, Clone)]
pub struct StableVecNat(pub Vec<Nat>);

impl Storable for StableVecNat {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(candid::encode_one(&self.0).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        StableVecNat(candid::decode_one(&bytes).unwrap())
    }

    const BOUND: Bound = Bound::Unbounded;
}

// Stable wrapper for Vec<UnlockEvent>
#[derive(CandidType, Clone)]
pub struct StableVecUnlockEvent(pub Vec<UnlockEvent>);

impl Storable for StableVecUnlockEvent {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(candid::encode_one(&self.0).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        StableVecUnlockEvent(candid::decode_one(&bytes).unwrap())
    }

    const BOUND: Bound = Bound::Unbounded;
}

// Protocol stats structure
#[derive(CandidType, Serialize, Deserialize)]
pub struct ProtocolStats {
    pub total_staked: Nat,
    pub total_locked: Nat,
    pub total_rewards_distributed: Nat,
    pub total_stakers: u64,
}

// ULTRA-MVP Burn-related data structures with Storable implementations
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct Attempts {
    pub win_start: u64,      // Start of 10-minute window
    pub small_cnt: u64,      // Count of attempts below minimum
    pub total_cnt: u64,      // Total attempts in window
    pub lockout_until: u64,  // Lockout timestamp
}

impl Storable for Attempts {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct BurnEvent {
    pub amount: Nat,           // Original amount to burn
    pub burned: Nat,           // Amount actually burned (80%)
    pub treasury: Nat,         // Amount sent to treasury (20%)
    pub block_index: Nat,      // Block index of the burn transaction
    pub created_at: u64,       // Timestamp of the burn
}

impl Storable for BurnEvent {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

// Early Staking Program data structures
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct EarlyStakingData {
    pub is_participant: bool,
    pub joined_at: u64,
    pub lifetime_bonus_eligible: bool,
}

impl Storable for EarlyStakingData {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

// Stable wrapper for u64 count
#[derive(CandidType, Clone)]
pub struct StableU64(pub u64);

impl Storable for StableU64 {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(self.0.to_le_bytes().to_vec())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        let mut arr = [0u8; 8];
        arr.copy_from_slice(&bytes[..8]);
        StableU64(u64::from_le_bytes(arr))
    }

    const BOUND: Bound = Bound::Bounded { max_size: 8, is_fixed_size: true };
}

// Stable wrapper for Vec<BurnEvent>
#[derive(CandidType, Clone)]
pub struct StableVecBurnEvent(pub Vec<BurnEvent>);

impl Storable for StableVecBurnEvent {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(candid::encode_one(&self.0).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        StableVecBurnEvent(candid::decode_one(&bytes).unwrap())
    }

    const BOUND: Bound = Bound::Unbounded;
}

// Stable storage declarations
thread_local! {
    pub static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(
        MemoryManager::init(DefaultMemoryImpl::default())
    );

    pub static STAKERS: RefCell<StableBTreeMap<Principal, StakerData, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(StableStorageId::Stakers.id()))))
    );

    pub static TRANSACTIONS: RefCell<StableBTreeMap<Principal, StableVecNat, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(StableStorageId::Transactions.id()))))
    );

    pub static UNLOCK_EVENTS: RefCell<StableBTreeMap<Principal, StableVecUnlockEvent, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(StableStorageId::UnlockEvents.id()))))
    );

    pub static TOTAL_STAKED: RefCell<Cell<StableNat, Memory>> = RefCell::new(
        Cell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(StableStorageId::TotalStaked.id()))), 
            StableNat(Nat::from(0u64))
        ).unwrap()
    );

    pub static TOTAL_LOCKED: RefCell<Cell<StableNat, Memory>> = RefCell::new(
        Cell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(StableStorageId::TotalLocked.id()))), 
            StableNat(Nat::from(0u64))
        ).unwrap()
    );

    pub static TOTAL_REWARDS_DISTRIBUTED: RefCell<Cell<StableNat, Memory>> = RefCell::new(
        Cell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(StableStorageId::TotalRewardsDistributed.id()))), 
            StableNat(Nat::from(0u64))
        ).unwrap()
    );

    // ULTRA-MVP Burn-related stable storage
    pub static BURN_ATTEMPTS: RefCell<StableBTreeMap<Principal, Attempts, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(StableStorageId::BurnAttempts.id()))))
    );

    pub static BURN_EVENTS: RefCell<StableBTreeMap<Principal, StableVecBurnEvent, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(StableStorageId::BurnEvents.id()))))
    );

    pub static TOTAL_BURNED: RefCell<Cell<StableNat, Memory>> = RefCell::new(
        Cell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(StableStorageId::TotalBurned.id()))), 
            StableNat(Nat::from(0u64))
        ).unwrap()
    );

    pub static TOTAL_TO_TREASURY: RefCell<Cell<StableNat, Memory>> = RefCell::new(
        Cell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(StableStorageId::TotalToTreasury.id()))), 
            StableNat(Nat::from(0u64))
        ).unwrap()
    );

    // Early Staking Program stable storage
    pub static EARLY_STAKING_PARTICIPANTS: RefCell<StableBTreeMap<Principal, EarlyStakingData, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(StableStorageId::EarlyStakingParticipants.id()))))
    );

    pub static EARLY_STAKING_COUNT: RefCell<Cell<StableU64, Memory>> = RefCell::new(
        Cell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(StableStorageId::EarlyStakingCount.id()))), 
            StableU64(0u64)
        ).unwrap()
    );
}

// New stable structure access methods
pub fn mutate_stakers<F, R>(f: F) -> R
where
    F: FnOnce(&mut StableBTreeMap<Principal, StakerData, Memory>) -> R,
{
    STAKERS.with(|s| f(&mut s.borrow_mut()))
}

pub fn read_stakers<F, R>(f: F) -> R
where
    F: FnOnce(&StableBTreeMap<Principal, StakerData, Memory>) -> R,
{
    STAKERS.with(|s| f(&s.borrow()))
}

pub fn mutate_transactions<F, R>(f: F) -> R
where
    F: FnOnce(&mut StableBTreeMap<Principal, StableVecNat, Memory>) -> R,
{
    TRANSACTIONS.with(|t| f(&mut t.borrow_mut()))
}

pub fn read_transactions<F, R>(f: F) -> R
where
    F: FnOnce(&StableBTreeMap<Principal, StableVecNat, Memory>) -> R,
{
    TRANSACTIONS.with(|t| f(&t.borrow()))
}

pub fn mutate_unlock_events<F, R>(f: F) -> R
where
    F: FnOnce(&mut StableBTreeMap<Principal, StableVecUnlockEvent, Memory>) -> R,
{
    UNLOCK_EVENTS.with(|u| f(&mut u.borrow_mut()))
}

pub fn read_unlock_events<F, R>(f: F) -> R
where
    F: FnOnce(&StableBTreeMap<Principal, StableVecUnlockEvent, Memory>) -> R,
{
    UNLOCK_EVENTS.with(|u| f(&u.borrow()))
}

// ULTRA-MVP Burn-related access methods
pub fn mutate_burn_attempts<F, R>(f: F) -> R
where
    F: FnOnce(&mut StableBTreeMap<Principal, Attempts, Memory>) -> R,
{
    BURN_ATTEMPTS.with(|b| f(&mut b.borrow_mut()))
}

pub fn read_burn_attempts<F, R>(f: F) -> R
where
    F: FnOnce(&StableBTreeMap<Principal, Attempts, Memory>) -> R,
{
    BURN_ATTEMPTS.with(|b| f(&b.borrow()))
}

pub fn mutate_burn_events<F, R>(f: F) -> R
where
    F: FnOnce(&mut StableBTreeMap<Principal, StableVecBurnEvent, Memory>) -> R,
{
    BURN_EVENTS.with(|b| f(&mut b.borrow_mut()))
}

pub fn read_burn_events<F, R>(f: F) -> R
where
    F: FnOnce(&StableBTreeMap<Principal, StableVecBurnEvent, Memory>) -> R,
{
    BURN_EVENTS.with(|b| f(&b.borrow()))
}

// Early Staking Program access methods
pub fn mutate_early_staking_participants<F, R>(f: F) -> R
where
    F: FnOnce(&mut StableBTreeMap<Principal, EarlyStakingData, Memory>) -> R,
{
    EARLY_STAKING_PARTICIPANTS.with(|e| f(&mut e.borrow_mut()))
}

pub fn read_early_staking_participants<F, R>(f: F) -> R
where
    F: FnOnce(&StableBTreeMap<Principal, EarlyStakingData, Memory>) -> R,
{
    EARLY_STAKING_PARTICIPANTS.with(|e| f(&e.borrow()))
}

// Early Staking Program functions
pub fn join_early_staking_program(principal: Principal) -> Result<(), &'static str> {
    // Check if already a participant
    if read_early_staking_participants(|participants| participants.contains_key(&principal)) {
        return Err("Already participating in early staking program");
    }
    
    // Check if program is full
    let current_count = EARLY_STAKING_COUNT.with(|count| count.borrow().get().0);
    if current_count >= 100 {
        return Err("Early staking program is full");
    }
    
    let now = time();
    
    // Add participant
    mutate_early_staking_participants(|participants| {
        participants.insert(principal, EarlyStakingData {
            is_participant: true,
            joined_at: now,
            lifetime_bonus_eligible: true,
        });
    });
    
    // Update count
    EARLY_STAKING_COUNT.with(|count| {
        let mut writer = count.borrow_mut();
        let new_count = writer.get().0 + 1;
        writer.set(StableU64(new_count)).unwrap();
    });
    
    Ok(())
}

pub fn is_early_staking_participant(principal: &Principal) -> bool {
    read_early_staking_participants(|participants| {
        participants.get(principal)
            .map(|data| data.is_participant)
            .unwrap_or(false)
    })
}

pub fn get_early_staking_data(principal: &Principal) -> Option<EarlyStakingData> {
    read_early_staking_participants(|participants| participants.get(principal))
}

pub fn get_early_staking_count() -> u64 {
    EARLY_STAKING_COUNT.with(|count| count.borrow().get().0)
}

pub fn get_early_staking_slots_remaining() -> u64 {
    let current_count = get_early_staking_count();
    if current_count >= 100 {
        0
    } else {
        100 - current_count
    }
}

// Staking functions using stable structures
pub fn stake(principal: Principal, amount: Nat) {
    let now = time();
    let unlock_time = now + 30 * 24 * 60 * 60 * 1_000_000_000; // 30 days in nanoseconds
    
    // Update or create staker data
    mutate_stakers(|stakers| {
        let mut staker_data = stakers.get(&principal).unwrap_or_else(|| StakerData {
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
        
        stakers.insert(principal, staker_data);
    });
    
    // Add transaction
    mutate_transactions(|transactions| {
        let mut tx_vec = transactions.get(&principal)
            .map(|v| v.0.clone())
            .unwrap_or_default();
        tx_vec.push(amount.clone());
        transactions.insert(principal, StableVecNat(tx_vec));
    });
    
    // Create unlock event
    mutate_unlock_events(|unlock_events| {
        let mut events = unlock_events.get(&principal)
            .map(|v| v.0.clone())
            .unwrap_or_default();
        
        let tx_index = read_transactions(|transactions| {
            Nat::from(transactions.get(&principal)
                .map(|v| v.0.len())
                .unwrap_or(0) as u64)
        });
        
        events.push(UnlockEvent {
            amount: amount.clone(),
            unlock_time,
            created_at: now,
            tx_index,
        });
        
        unlock_events.insert(principal, StableVecUnlockEvent(events));
    });
    
    // Update protocol metrics
    TOTAL_STAKED.with(|total| {
        let mut writer = total.borrow_mut();
        let mut current = writer.get().0.clone();
        current += amount.clone();
        writer.set(StableNat(current)).unwrap();
    });
    
    TOTAL_LOCKED.with(|total| {
        let mut writer = total.borrow_mut();
        let mut current = writer.get().0.clone();
        current += amount;
        writer.set(StableNat(current)).unwrap();
    });
}

pub fn withdraw_unlocked(principal: Principal) -> Nat {
    let now = time();
    let mut total_withdrawn = Nat::from(0u64);
    
    // Process unlock events
    mutate_unlock_events(|unlock_events| {
        if let Some(events_wrapper) = unlock_events.get(&principal) {
            let mut events = events_wrapper.0.clone();
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
            
            // Update events
            unlock_events.insert(principal, StableVecUnlockEvent(events));
        }
    });
    
    // Update staker data if we have withdrawals
    if total_withdrawn > Nat::from(0u64) {
        mutate_stakers(|stakers| {
            if let Some(mut staker_data) = stakers.get(&principal) {
                staker_data.active_stake -= total_withdrawn.clone();
                staker_data.pending_unlock -= total_withdrawn.clone();
                staker_data.total_withdrawn += total_withdrawn.clone();
                stakers.insert(principal, staker_data);
            }
        });
        
        // Update protocol metrics
        TOTAL_LOCKED.with(|total| {
            let mut writer = total.borrow_mut();
            let mut current = writer.get().0.clone();
            if current >= total_withdrawn.clone() {
                current -= total_withdrawn.clone();
            } else {
                current = Nat::from(0u64);
            }
            writer.set(StableNat(current)).unwrap();
        });
    }
    
    total_withdrawn
}

// Query functions using stable structures
pub fn get_staker_data(principal: &Principal) -> Option<StakerData> {
    read_stakers(|stakers| stakers.get(principal))
}

pub fn get_transactions(principal: &Principal) -> Vec<Nat> {
    read_transactions(|transactions| {
        transactions.get(principal)
            .map(|v| v.0.clone())
            .unwrap_or_default()
    })
}

pub fn get_pending_unlock_events(principal: &Principal) -> Vec<UnlockEvent> {
    read_unlock_events(|unlock_events| {
        unlock_events.get(principal)
            .map(|events_wrapper| {
                events_wrapper.0.iter()
                    .filter(|e| time() < e.unlock_time)
                    .cloned()
                    .collect()
            })
            .unwrap_or_default()
    })
}

pub fn get_ready_to_unlock_events(principal: &Principal) -> Vec<UnlockEvent> {
    read_unlock_events(|unlock_events| {
        unlock_events.get(principal)
            .map(|events_wrapper| {
                events_wrapper.0.iter()
                    .filter(|e| time() >= e.unlock_time)
                    .cloned()
                    .collect()
            })
            .unwrap_or_default()
    })
}

pub fn get_protocol_stats() -> ProtocolStats {
    let total_staked = TOTAL_STAKED.with(|t| t.borrow().get().0.clone());
    let total_locked = TOTAL_LOCKED.with(|t| t.borrow().get().0.clone());
    let total_rewards_distributed = TOTAL_REWARDS_DISTRIBUTED.with(|t| t.borrow().get().0.clone());
    let total_stakers = read_stakers(|stakers| stakers.len() as u64);
    
    ProtocolStats {
        total_staked,
        total_locked,
        total_rewards_distributed,
        total_stakers,
    }
}
