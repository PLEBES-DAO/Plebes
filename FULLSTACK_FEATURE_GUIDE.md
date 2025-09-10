# Full-Stack Feature Development Guide

## Overview

This guide explains how to add new full-stack features to the Plebes Frontend ICP project following established patterns. The project uses a modular architecture with **stable structures** for data persistence across canister upgrades.

**Key Architecture Components:**
- **Backend**: Rust-based Internet Computer canisters with stable structures for persistent state
- **Frontend**: React with custom hook providers for state management  
- **Communication**: Candid IDL interfaces for type-safe frontend-backend communication
- **Data Persistence**: IC-stable-structures for upgrade-safe data storage

## Critical: Stable Structures Pattern

Based on the BurnRoulette implementation, all persistent data **MUST** use stable structures to ensure data persists across canister upgrades. This is different from the current plebes_frontend implementation.

### Current plebes_frontend State Issues

The current implementation uses thread-local `RefCell<State>`:

```rust
// ❌ CURRENT - Data will be lost on upgrade
thread_local! {
    pub static STATE: std::cell::RefCell<State> = std::cell::RefCell::new(State::default());
}
```

### Required: Stable Structures Pattern

All new features must use the stable structures pattern:

```rust
// ✅ REQUIRED - Data persists across upgrades
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    storable::Bound,
    BTreeMap as StableBTreeMap,
    BTreeSet as StableBTreeSet,
    Cell,
    DefaultMemoryImpl,
    Storable
};

type Memory = VirtualMemory<DefaultMemoryImpl>;

// Memory ID enum for tracking assignments
#[derive(Clone, Copy, Debug)]
pub enum StableStorageId {
    // Existing IDs from plebes_frontend
    Stakers,           // 1
    Transactions,      // 2  
    UnlockEvents,      // 3
    // Add new feature IDs starting from 4
    UserProfiles,      // 4
    Settings,          // 5
}

impl StableStorageId {
    pub fn id(&self) -> u8 {
        match self {
            StableStorageId::Stakers => 1,
            StableStorageId::Transactions => 2,
            StableStorageId::UnlockEvents => 3,
            StableStorageId::UserProfiles => 4,
            StableStorageId::Settings => 5,
        }
    }
}
```

## Step-by-Step Migration & Feature Development

### Step 1: Migrate Existing State to Stable Structures

**CRITICAL**: Before adding new features, the existing state must be migrated:

#### 1.1 Update Dependencies

Add to `Cargo.toml`:
```toml
[dependencies]
ic-stable-structures = "0.6.5"
```

#### 1.2 Create Storable Wrappers

```rust
// In state.rs
use std::borrow::Cow;

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

// Make existing types Storable
impl Storable for StakerData {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

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
```

#### 1.3 Replace Thread-Local Storage

```rust
// Replace the current STATE with stable structures
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
        Cell::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(StableStorageId::TotalStaked.id()))), StableNat(Nat::from(0u64))).unwrap()
    );

    pub static TOTAL_LOCKED: RefCell<Cell<StableNat, Memory>> = RefCell::new(
        Cell::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(StableStorageId::TotalLocked.id()))), StableNat(Nat::from(0u64))).unwrap()
    );
}
```

#### 1.4 Update State Access Methods

```rust
// Replace current state access methods
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
```

### Step 2: Add Upgrade Hooks

**CRITICAL**: Add `init` and `post_upgrade` functions to maintain data persistence:

```rust
// In lib.rs
use ic_cdk::{init, post_upgrade};

#[init]
fn init() {
    ic_cdk::println!("Initializing Plebes Frontend canister with stable structures");
    
    // Initialize any timers or background processes
    // Example: restart reward timers for all active stakers
    let stakers: Vec<Principal> = read_stakers(|s| s.iter().map(|(k, _)| k.clone()).collect());
    for principal in stakers {
        start_daily_rewards(principal);
    }
}

#[post_upgrade] 
fn post_upgrade() {
    ic_cdk::println!("Plebes Frontend canister upgraded - restoring all timers and processes");
    
    // Restart reward timers for all active stakers
    let stakers: Vec<Principal> = read_stakers(|s| s.iter().map(|(k, _)| k.clone()).collect());
    for principal in stakers {
        start_daily_rewards(principal);
    }
    
    // Restore any other background processes or timers
}
```

### Step 3: Adding New Features with Stable Structures

Now you can safely add new features. Here's the complete pattern:

#### 3.1 Create New Feature Module

```rust
// new_feature.rs
use ic_stable_structures::Storable;
use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};
use std::borrow::Cow;

#[derive(CandidType, Deserialize, Serialize, Clone)]
pub struct UserProfile {
    pub username: String,
    pub email: Option<String>,
    pub created_at: u64,
    pub updated_at: u64,
    pub settings: UserSettings,
}

#[derive(CandidType, Deserialize, Serialize, Clone)]
pub struct UserSettings {
    pub notifications: bool,
    pub theme: String,
    pub language: String,
}

// Make it Storable for stable structures
impl Storable for UserProfile {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}

#[derive(CandidType, Deserialize, Serialize, Debug, Clone)]
pub enum ProfileError {
    UserNotFound,
    UsernameAlreadyExists,
    InvalidInput(String),
}

// CRUD operations using stable structures
pub fn create_profile(principal: Principal, username: String, email: Option<String>) -> Result<(), ProfileError> {
    let now = ic_cdk::api::time();
    
    PROFILES.with(|profiles| {
        let mut map = profiles.borrow_mut();
        
        // Check if profile already exists
        if map.contains_key(&principal) {
            return Err(ProfileError::UsernameAlreadyExists);
        }
        
        let profile = UserProfile {
            username: username.clone(),
            email,
            created_at: now,
            updated_at: now,
            settings: UserSettings {
                notifications: true,
                theme: "light".to_string(),
                language: "en".to_string(),
            },
        };
        
        map.insert(principal, profile);
        Ok(())
    })
}

pub fn get_profile(principal: &Principal) -> Result<UserProfile, ProfileError> {
    PROFILES.with(|profiles| {
        profiles.borrow()
            .get(principal)
            .ok_or(ProfileError::UserNotFound)
    })
}

pub fn update_profile(principal: Principal, username: Option<String>, email: Option<String>) -> Result<(), ProfileError> {
    let now = ic_cdk::api::time();
    
    PROFILES.with(|profiles| {
        let mut map = profiles.borrow_mut();
        
        if let Some(mut profile) = map.get(&principal) {
            if let Some(new_username) = username {
                profile.username = new_username;
            }
            if let Some(new_email) = email {
                profile.email = Some(new_email);
            }
            profile.updated_at = now;
            
            map.insert(principal, profile);
            Ok(())
        } else {
            Err(ProfileError::UserNotFound)
        }
    })
}
```

#### 3.2 Add Storage Declaration

```rust
// In state.rs - add to the thread_local! block
pub static PROFILES: RefCell<StableBTreeMap<Principal, UserProfile, Memory>> = RefCell::new(
    StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(StableStorageId::UserProfiles.id()))))
);
```

#### 3.3 Update lib.rs with API Functions

```rust
// In lib.rs
pub mod new_feature;
use crate::new_feature::{UserProfile, ProfileError, create_profile, get_profile, update_profile};

#[update]
async fn create_user_profile(username: String, email: Option<String>) -> Result<(), ProfileError> {
    let caller = ic_cdk::caller();
    create_profile(caller, username, email)
}

#[query]
async fn get_user_profile(principal: Option<Principal>) -> Result<UserProfile, ProfileError> {
    let target = principal.unwrap_or_else(|| ic_cdk::caller());
    get_profile(&target)
}

#[update]
async fn update_user_profile(username: Option<String>, email: Option<String>) -> Result<(), ProfileError> {
    let caller = ic_cdk::caller();
    update_profile(caller, username, email)
}
```

### Step 4: Frontend Integration

#### 4.1 Generate Candid Interfaces

After backend changes, regenerate the Candid interface:

```bash
# From backend directory
cargo build --release --target wasm32-unknown-unknown
candid-extractor target/wasm32-unknown-unknown/release/backend_backend.wasm > backend_backend.did
```

#### 4.2 Update Frontend Interfaces

```javascript
// /src/ic/user_profile/index.did.js
export const idlFactory = ({ IDL }) => {
  const UserSettings = IDL.Record({
    'notifications': IDL.Bool,
    'theme': IDL.Text,
    'language': IDL.Text,
  });
  
  const UserProfile = IDL.Record({
    'username': IDL.Text,
    'email': IDL.Opt(IDL.Text),
    'created_at': IDL.Nat64,
    'updated_at': IDL.Nat64,
    'settings': UserSettings,
  });
  
  const ProfileError = IDL.Variant({
    'UserNotFound': IDL.Null,
    'UsernameAlreadyExists': IDL.Null,
    'InvalidInput': IDL.Text,
  });
  
  const Result = IDL.Variant({ 'Ok': IDL.Null, 'Err': ProfileError });
  const Result_1 = IDL.Variant({ 'Ok': UserProfile, 'Err': ProfileError });
  
  return IDL.Service({
    'create_user_profile': IDL.Func([IDL.Text, IDL.Opt(IDL.Text)], [Result], []),
    'get_user_profile': IDL.Func([IDL.Opt(IDL.Principal)], [Result_1], ['query']),
    'update_user_profile': IDL.Func([IDL.Opt(IDL.Text), IDL.Opt(IDL.Text)], [Result], []),
  });
};
```

#### 4.3 Create React Hook Provider

```typescript
// /src/hooks/UserProfileContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { createUserProfileActor } from "../ic/user_profile/index.js";
import { useBioniqContext } from "./BioniqContext.jsx";

const UserProfileContext = createContext(null);

export const useUserProfileClient = () => {
  const { identity, setError } = useBioniqContext();
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const canisterId = "your-canister-id-here";

  const createActor = () => {
    return createUserProfileActor(canisterId, {
      agentOptions: { identity }
    });
  };

  const createProfile = async (username: string, email?: string) => {
    setIsLoading(true);
    try {
      const actor = createActor();
      const result = await actor.create_user_profile(username, email ? [email] : []);
      
      if ('Ok' in result) {
        await fetchUserProfile();
        return result.Ok;
      } else {
        const errorKey = Object.keys(result.Err)[0];
        setError(`Profile creation failed: ${errorKey}`);
        throw result.Err;
      }
    } catch (error) {
      console.error("Profile creation failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserProfile = async (principal?: string) => {
    try {
      const actor = createActor();
      const result = await actor.get_user_profile(principal ? [principal] : []);
      
      if ('Ok' in result) {
        setUserProfile(result.Ok);
        return result.Ok;
      } else {
        if (!result.Err.UserNotFound) {
          setError("Error fetching user profile");
        }
        setUserProfile(null);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  const updateProfile = async (username?: string, email?: string) => {
    setIsLoading(true);
    try {
      const actor = createActor();
      const result = await actor.update_user_profile(
        username ? [username] : [],
        email ? [email] : []
      );
      
      if ('Ok' in result) {
        await fetchUserProfile();
        return result.Ok;
      } else {
        const errorKey = Object.keys(result.Err)[0];
        setError(`Profile update failed: ${errorKey}`);
        throw result.Err;
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (identity) {
      fetchUserProfile();
    }
  }, [identity]);

  return {
    userProfile,
    isLoading,
    createProfile,
    fetchUserProfile,
    updateProfile,
  };
};

export const UserProfileProvider = ({ children }) => {
  const userProfileClient = useUserProfileClient();
  return (
    <UserProfileContext.Provider value={userProfileClient}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => useContext(UserProfileContext);
```

## Advanced Patterns for Stable Structures

### Complex Data Types

```rust
// For storing collections within stable structures
#[derive(CandidType, Clone)]
pub struct StableVecString(pub Vec<String>);

impl Storable for StableVecString {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(candid::encode_one(&self.0).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        StableVecString(candid::decode_one(&bytes).unwrap())
    }

    const BOUND: Bound = Bound::Unbounded;
}
```

### Nested Stable Structures

```rust
// For features that need multiple related data structures
thread_local! {
    // User profiles
    pub static USER_PROFILES: RefCell<StableBTreeMap<Principal, UserProfile, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(StableStorageId::UserProfiles.id()))))
    );

    // User settings (separate for performance)
    pub static USER_SETTINGS: RefCell<StableBTreeMap<Principal, UserSettings, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(StableStorageId::UserSettings.id()))))
    );

    // User activity logs
    pub static USER_ACTIVITY: RefCell<StableBTreeMap<Principal, StableVecActivity, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(StableStorageId::UserActivity.id()))))
    );
}
```

### Memory Management Best Practices

1. **Sequential Memory IDs**: Always assign memory IDs sequentially to avoid conflicts
2. **Documentation**: Document what each memory ID is used for
3. **Migration Strategy**: Plan for data migrations when updating structures

```rust
// Memory ID planning
#[derive(Clone, Copy, Debug)]
pub enum StableStorageId {
    // Core staking features (1-10)
    Stakers,           // 1
    Transactions,      // 2  
    UnlockEvents,      // 3
    TotalStaked,       // 4
    TotalLocked,       // 5
    
    // User management features (11-20)
    UserProfiles,      // 11
    UserSettings,      // 12
    UserActivity,      // 13
    
    // Game/Rewards features (21-30)
    Achievements,      // 21
    Rewards,           // 22
    
    // Analytics features (31-40)
    Analytics,         // 31
    
    // Reserve 41-50 for future expansion
}
```

## Deployment & Migration Checklist

### Pre-Deployment
- [ ] All data structures implement `Storable`
- [ ] Memory IDs are unique and documented
- [ ] `init` and `post_upgrade` functions are implemented
- [ ] Migration functions for existing data (if needed)

### Deployment Steps
1. **Test Migration**: Test upgrade locally with existing data
2. **Backup Data**: Export critical data before deployment
3. **Deploy**: Deploy with upgrade hooks
4. **Verify**: Verify data persistence after upgrade
5. **Monitor**: Monitor canister performance and memory usage

### Post-Deployment
- [ ] Verify all timers and background processes restart correctly
- [ ] Test CRUD operations work as expected
- [ ] Monitor memory usage growth
- [ ] Update frontend integration

## Testing Strategy

### Backend Tests with Stable Structures

```rust
// feature_tests.rs
use pocket_ic::PocketIc;

#[test]
fn test_profile_persistence_across_upgrade() {
    let pic = PocketIc::new();
    let canister_id = pic.create_canister();
    pic.add_cycles(canister_id, 2_000_000_000_000);

    // Deploy canister
    let wasm_bytes = load_wasm();
    pic.install_canister(canister_id, wasm_bytes.clone(), vec![], None);

    // Create profile
    let create_result: Result<(), String> = pic.update_call(
        canister_id,
        Principal::anonymous(),
        "create_user_profile",
        candid::encode_args(("testuser", None::<String>)).unwrap(),
    ).unwrap();
    assert!(create_result.is_ok());

    // Upgrade canister
    pic.upgrade_canister(canister_id, wasm_bytes, vec![], None).unwrap();

    // Verify profile still exists
    let profile_result: Result<UserProfile, ProfileError> = pic.query_call(
        canister_id,
        Principal::anonymous(),
        "get_user_profile",
        candid::encode_args((None::<Principal>,)).unwrap(),
    ).unwrap();
    
    assert!(profile_result.is_ok());
    assert_eq!(profile_result.unwrap().username, "testuser");
}
```

## Error Handling & Recovery

### Graceful Degradation

```rust
// Handle potential corruption or migration issues
pub fn safe_get_profile(principal: &Principal) -> Option<UserProfile> {
    PROFILES.with(|profiles| {
        match profiles.borrow().get(principal) {
            Some(profile) => Some(profile),
            None => {
                // Profile not found - this is normal
                None
            }
        }
    })
}

// Recover from potential data corruption
pub fn validate_and_repair_profile(principal: Principal) -> Result<(), String> {
    PROFILES.with(|profiles| {
        let mut map = profiles.borrow_mut();
        if let Some(mut profile) = map.get(&principal) {
            // Validate profile data
            if profile.username.is_empty() {
                profile.username = format!("user_{}", principal.to_text()[..8].to_string());
            }
            if profile.created_at == 0 {
                profile.created_at = ic_cdk::api::time();
            }
            // Save repaired profile
            map.insert(principal, profile);
        }
        Ok(())
    })
}
```

## Performance Considerations

### Memory Optimization

```rust
// Use bounded types where possible for better performance
impl Storable for SmallProfile {
    const BOUND: Bound = Bound::Bounded {
        max_size: 1024,  // 1KB max per profile
        is_fixed_size: false,
    };
    
    // ... implementation
}
```

### Batch Operations

```rust
// Process multiple operations efficiently
pub fn batch_update_profiles(updates: Vec<(Principal, UserProfile)>) -> Result<u64, String> {
    let mut count = 0;
    PROFILES.with(|profiles| {
        let mut map = profiles.borrow_mut();
        for (principal, profile) in updates {
            map.insert(principal, profile);
            count += 1;
        }
    });
    Ok(count)
}
```

This comprehensive guide ensures that all new features in the Plebes Frontend project will use stable structures for proper data persistence across canister upgrades, following the battle-tested patterns from the BurnRoulette implementation.
