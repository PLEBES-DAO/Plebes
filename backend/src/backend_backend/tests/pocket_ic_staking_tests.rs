use candid::{Nat, Principal, encode_args, decode_one};
use pocket_ic::{PocketIc, WasmResult};
use std::time::Duration;
use serde::{Deserialize, Serialize};
use candid::CandidType;

// Re-define types for testing since they're not exported from the crate root
#[derive(CandidType, Deserialize, Serialize, Debug, Clone)]
pub enum StakingError {
    TransferFailed(String), // Simplified for testing
    TransferError(String),
    CanisterCallFailed(u32, String),
    InsufficientBalance,
    LockupPeriodNotEnded,
    AlreadyStaking,
    NotStaking,
    InvalidAmount,
    InternalError(String),
}

#[derive(CandidType, Serialize, Deserialize, Debug)]
pub struct StakingInfo {
    pub staked_amount: Nat,
    pub reward_amount: Nat,
    pub start_time: u64,
    pub last_claim_time: u64,
    pub unlock_time: u64,
}

#[derive(CandidType, Serialize, Deserialize, Debug)]
pub struct ProtocolStats {
    pub total_staked: Nat,
    pub total_locked: Nat,
    pub total_rewards_distributed: Nat,
    pub total_stakers: u64,
}

const STAKING_WASM_PATH: &str = "../../../target/wasm32-unknown-unknown/release/backend_backend.wasm";

pub struct StakingTestSetup {
    pub pic: PocketIc,
    pub staking_canister: Principal,
    pub mock_ledger: Principal,
    pub user1: Principal,
    pub user2: Principal,
}

impl StakingTestSetup {
    pub fn new() -> Self {
        // Create a PocketIC instance
        let pic = PocketIc::new();
        
        // Create test users with simple, valid principals
        let user1 = Principal::from_text("2chl6-4hpzw-vqaaa-aaaaa-c").unwrap();
        let user2 = Principal::anonymous(); // Use anonymous for user2
        
        // Create mock ledger canister (for now, just create a canister without WASM)
        let mock_ledger = pic.create_canister();
        pic.add_cycles(mock_ledger, 2_000_000_000_000); // 2T cycles
        // Skip mock ledger WASM installation for now - we'll implement later
        
        // Install staking canister
        let staking_canister = pic.create_canister();
        pic.add_cycles(staking_canister, 2_000_000_000_000); // 2T cycles
        let staking_wasm = std::fs::read(STAKING_WASM_PATH)
            .expect("Could not read staking WASM file. Make sure to build with: cargo build --target wasm32-unknown-unknown --release");
        pic.install_canister(staking_canister, staking_wasm, vec![], None);
        
        let setup = StakingTestSetup {
            pic,
            staking_canister,
            mock_ledger,
            user1,
            user2,
        };
        
        // Set the mock ledger as the token canister
        setup.set_token_canister(setup.mock_ledger);
        
        setup
    }
    
    pub fn set_token_canister(&self, ledger_id: Principal) {
        let result = self.pic.update_call(
            self.staking_canister,
            Principal::anonymous(),
            "set_token_canister",
            encode_args((ledger_id,)).unwrap(),
        );
        
        match result {
            Ok(WasmResult::Reply(_)) => {},
            Ok(WasmResult::Reject(msg)) => panic!("Set token canister rejected: {}", msg),
            Err(e) => panic!("Set token canister failed: {:?}", e),
        }
    }
    
    pub fn get_token_canister(&self) -> Principal {
        let result = self.pic.query_call(
            self.staking_canister,
            Principal::anonymous(),
            "get_token_canister",
            encode_args(()).unwrap(),
        );
        
        match result {
            Ok(WasmResult::Reply(bytes)) => decode_one(&bytes).unwrap(),
            _ => panic!("Failed to get token canister"),
        }
    }
    
    pub fn stake(&self, caller: Principal, amount: u64) -> Result<Nat, String> {
        // Only approve if amount is greater than 0 (avoid calling mock ledger for invalid amounts)
        if amount > 0 {
            self.mock_ledger_approve(caller, self.staking_canister, amount);
        }
        
        let result = self.pic.update_call(
            self.staking_canister,
            caller,
            "stake",
            encode_args((Nat::from(amount),)).unwrap(),
        );
        
        match result {
            Ok(WasmResult::Reply(bytes)) => {
                let stake_result: Result<Nat, StakingError> = decode_one(&bytes).unwrap();
                match stake_result {
                    Ok(block_index) => Ok(block_index),
                    Err(e) => Err(format!("Staking error: {:?}", e)),
                }
            }
            Ok(WasmResult::Reject(msg)) => Err(format!("Stake rejected: {}", msg)),
            Err(e) => Err(format!("Stake failed: {:?}", e)),
        }
    }
    
    pub fn start_staking(&self, caller: Principal) -> Result<Nat, String> {
        let result = self.pic.update_call(
            self.staking_canister,
            caller,
            "start_staking",
            encode_args(()).unwrap(),
        );
        
        match result {
            Ok(WasmResult::Reply(bytes)) => {
                let stake_result: Result<Nat, StakingError> = decode_one(&bytes).unwrap();
                match stake_result {
                    Ok(block_index) => Ok(block_index),
                    Err(e) => Err(format!("Start staking error: {:?}", e)),
                }
            }
            Ok(WasmResult::Reject(msg)) => Err(format!("Start staking rejected: {}", msg)),
            Err(e) => Err(format!("Start staking failed: {:?}", e)),
        }
    }
    
    pub fn withdraw(&self, caller: Principal) -> Result<Nat, String> {
        let result = self.pic.update_call(
            self.staking_canister,
            caller,
            "withdraw",
            encode_args(()).unwrap(),
        );
        
        match result {
            Ok(WasmResult::Reply(bytes)) => {
                let withdraw_result: Result<Nat, StakingError> = decode_one(&bytes).unwrap();
                match withdraw_result {
                    Ok(block_index) => Ok(block_index),
                    Err(e) => Err(format!("Withdraw error: {:?}", e)),
                }
            }
            Ok(WasmResult::Reject(msg)) => Err(format!("Withdraw rejected: {}", msg)),
            Err(e) => Err(format!("Withdraw failed: {:?}", e)),
        }
    }
    
    pub fn get_staking_balance(&self, caller: Principal) -> Result<StakingInfo, String> {
        let result = self.pic.query_call(
            self.staking_canister,
            caller,
            "my_staking_balance",
            encode_args(()).unwrap(),
        );
        
        match result {
            Ok(WasmResult::Reply(bytes)) => {
                let balance_result: Result<StakingInfo, StakingError> = decode_one(&bytes).unwrap();
                match balance_result {
                    Ok(info) => Ok(info),
                    Err(e) => Err(format!("Balance error: {:?}", e)),
                }
            }
            Ok(WasmResult::Reject(msg)) => Err(format!("Balance rejected: {}", msg)),
            Err(e) => Err(format!("Balance failed: {:?}", e)),
        }
    }
    
    pub fn get_protocol_stats(&self) -> ProtocolStats {
        let result = self.pic.query_call(
            self.staking_canister,
            Principal::anonymous(),
            "get_protocol_stats",
            encode_args(()).unwrap(),
        );
        
        match result {
            Ok(WasmResult::Reply(bytes)) => decode_one(&bytes).unwrap(),
            _ => panic!("Failed to get protocol stats"),
        }
    }
    
    pub fn compound_rewards(&self, caller: Principal) -> Result<(), String> {
        let result = self.pic.update_call(
            self.staking_canister,
            caller,
            "compound_rewards",
            encode_args(()).unwrap(),
        );
        
        match result {
            Ok(WasmResult::Reply(bytes)) => {
                let compound_result: Result<(), StakingError> = decode_one(&bytes).unwrap();
                match compound_result {
                    Ok(()) => Ok(()),
                    Err(e) => Err(format!("Compound error: {:?}", e)),
                }
            }
            Ok(WasmResult::Reject(msg)) => Err(format!("Compound rejected: {}", msg)),
            Err(e) => Err(format!("Compound failed: {:?}", e)),
        }
    }
    
    // Mock ledger functions
    pub fn mock_ledger_approve(&self, caller: Principal, spender: Principal, amount: u64) {
        let result = self.pic.update_call(
            self.mock_ledger,
            caller,
            "approve",
            encode_args((spender, Nat::from(amount))).unwrap(),
        );
        
        if let Err(e) = result {
            panic!("Mock ledger approve failed: {:?}", e);
        }
    }
    
    pub fn mock_ledger_mint(&self, to: Principal, amount: u64) {
        let result = self.pic.update_call(
            self.mock_ledger,
            Principal::anonymous(),
            "mint",
            encode_args((to, Nat::from(amount))).unwrap(),
        );
        
        if let Err(e) = result {
            panic!("Mock ledger mint failed: {:?}", e);
        }
    }
    
    pub fn mock_ledger_balance(&self, account: Principal) -> Nat {
        let result = self.pic.query_call(
            self.mock_ledger,
            Principal::anonymous(),
            "balance",
            encode_args((account,)).unwrap(),
        );
        
        match result {
            Ok(WasmResult::Reply(bytes)) => decode_one(&bytes).unwrap(),
            _ => Nat::from(0u64),
        }
    }
    
    pub fn advance_time(&mut self, duration: Duration) {
        self.pic.advance_time(duration);
        self.pic.tick();
    }
}

// TODO: Implement mock ledger WASM for comprehensive testing
// This would be needed for the ignored tests to work fully

#[test]
fn test_set_get_token_canister() {
    let setup = StakingTestSetup::new();
    
    // Test getting the token canister (should be our mock ledger)
    let token_canister = setup.get_token_canister();
    assert_eq!(token_canister, setup.mock_ledger);
    
    // Test setting a new token canister
    let new_canister = setup.user1; // Just use a different principal
    setup.set_token_canister(new_canister);
    
    let updated_canister = setup.get_token_canister();
    assert_eq!(updated_canister, new_canister);
}

#[test]
fn test_invalid_stake_amount() {
    let setup = StakingTestSetup::new();
    
    // Test staking with zero amount - should fail
    let result = setup.stake(setup.user1, 0);
    assert!(result.is_err());
    assert!(result.unwrap_err().contains("InvalidAmount"));
}

#[test]
fn test_protocol_stats_initial() {
    let setup = StakingTestSetup::new();
    
    let stats = setup.get_protocol_stats();
    assert_eq!(stats.total_staked, Nat::from(0u64));
    assert_eq!(stats.total_locked, Nat::from(0u64));
    assert_eq!(stats.total_stakers, 0);
}

#[test]
fn test_staking_balance_not_staking() {
    let setup = StakingTestSetup::new();
    
    // User hasn't staked anything, should get NotStaking error
    let result = setup.get_staking_balance(setup.user1);
    assert!(result.is_err());
    assert!(result.unwrap_err().contains("NotStaking"));
}

#[test]
fn test_withdraw_not_staking() {
    let setup = StakingTestSetup::new();
    
    // User hasn't staked anything, should get NotStaking error
    let result = setup.withdraw(setup.user1);
    assert!(result.is_err());
    assert!(result.unwrap_err().contains("NotStaking"));
}

#[test]
fn test_compound_rewards_not_staking() {
    let setup = StakingTestSetup::new();
    
    // User hasn't staked anything, should get NotStaking error
    let result = setup.compound_rewards(setup.user1);
    assert!(result.is_err());
    assert!(result.unwrap_err().contains("NotStaking"));
}

// This test would work if we had a proper mock ledger
#[test]
#[ignore] // Ignore until we have proper mock ledger
fn test_successful_staking() {
    let setup = StakingTestSetup::new();
    
    // Mint some tokens to user1
    setup.mock_ledger_mint(setup.user1, 1000);
    
    // User1 stakes 500 tokens
    let result = setup.stake(setup.user1, 500);
    assert!(result.is_ok());
    
    // Check protocol stats updated
    let stats = setup.get_protocol_stats();
    assert_eq!(stats.total_staked, Nat::from(500u64));
    assert_eq!(stats.total_stakers, 1);
    
    // Check user's staking balance
    let balance = setup.get_staking_balance(setup.user1);
    assert!(balance.is_ok());
    let info = balance.unwrap();
    assert_eq!(info.staked_amount, Nat::from(500u64));
}

// This test would work with proper mock ledger and time advancement
#[test]
#[ignore] // Ignore until we have proper mock ledger
fn test_withdraw_after_lockup() {
    let mut setup = StakingTestSetup::new();
    
    // Mint and stake tokens
    setup.mock_ledger_mint(setup.user1, 1000);
    let _stake_result = setup.stake(setup.user1, 500);
    
    // Try to withdraw immediately - should fail (lockup period not ended)
    let withdraw_result = setup.withdraw(setup.user1);
    assert!(withdraw_result.is_err());
    assert!(withdraw_result.unwrap_err().contains("LockupPeriodNotEnded"));
    
    // Advance time beyond lockup period (30 days)
    setup.advance_time(Duration::from_secs(31 * 24 * 60 * 60));
    
    // Now withdrawal should succeed
    let withdraw_result = setup.withdraw(setup.user1);
    assert!(withdraw_result.is_ok());
}

#[test]
fn test_time_advancement() {
    let mut setup = StakingTestSetup::new();
    
    // Test that time advancement works
    let initial_stats = setup.get_protocol_stats();
    
    // Advance time
    setup.advance_time(Duration::from_secs(3600)); // 1 hour
    
    // Stats should remain the same (no staking activity)
    let after_stats = setup.get_protocol_stats();
    assert_eq!(initial_stats.total_staked, after_stats.total_staked);
    assert_eq!(initial_stats.total_locked, after_stats.total_locked);
    assert_eq!(initial_stats.total_stakers, after_stats.total_stakers);
}
