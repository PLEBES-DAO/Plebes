use candid::{Nat, Principal, encode_args, decode_one};
use pocket_ic::{PocketIc, WasmResult};

// Re-define types for testing since they're not exported from the crate root
#[derive(candid::CandidType, serde::Deserialize, serde::Serialize, Debug)]
pub struct ProtocolStats {
    pub total_staked: Nat,
    pub total_locked: Nat,
    pub total_rewards_distributed: Nat,
    pub total_stakers: u64,
}

const STAKING_WASM_PATH: &str = "../../../target/wasm32-unknown-unknown/release/backend_backend.wasm";

#[test]
fn test_basic_pocket_ic_setup() {
    // Create a PocketIC instance
    let pic = PocketIc::new();
    
    // Install staking canister
    let staking_canister = pic.create_canister();
    pic.add_cycles(staking_canister, 2_000_000_000_000); // 2T cycles
    let staking_wasm = std::fs::read(STAKING_WASM_PATH)
        .expect("Could not read staking WASM file. Make sure to build with: cargo build --target wasm32-unknown-unknown --release");
    pic.install_canister(staking_canister, staking_wasm, vec![], None);
    
    // Test basic query call - get protocol stats
    let result = pic.query_call(
        staking_canister,
        Principal::anonymous(),
        "get_protocol_stats",
        encode_args(()).unwrap(),
    );
    
    match result {
        Ok(WasmResult::Reply(bytes)) => {
            let stats: ProtocolStats = decode_one(&bytes).unwrap();
            assert_eq!(stats.total_staked, Nat::from(0u64));
            assert_eq!(stats.total_locked, Nat::from(0u64));
            assert_eq!(stats.total_stakers, 0);
            println!("✅ Basic PocketIC test passed!");
        },
        Ok(WasmResult::Reject(msg)) => panic!("Query rejected: {}", msg),
        Err(e) => panic!("Query failed: {:?}", e),
    }
}

#[test]
fn test_token_canister_get_default() {
    let pic = PocketIc::new();
    
    let staking_canister = pic.create_canister();
    pic.add_cycles(staking_canister, 2_000_000_000_000); // 2T cycles
    let staking_wasm = std::fs::read(STAKING_WASM_PATH)
        .expect("Could not read staking WASM file");
    pic.install_canister(staking_canister, staking_wasm, vec![], None);
    
    // Just test getting the default token canister
    let result = pic.query_call(
        staking_canister,
        Principal::anonymous(),
        "get_token_canister",
        encode_args(()).unwrap(),
    );
    
    match result {
        Ok(WasmResult::Reply(bytes)) => {
            let retrieved_canister: Principal = decode_one(&bytes).unwrap();
            println!("✅ Got default token canister: {}", retrieved_canister);
            // The default should be the ICP ledger from our code
            let expected_default = Principal::from_text("olpbc-wyaaa-aaaag-acnya-cai").unwrap();
            assert_eq!(retrieved_canister, expected_default);
            println!("✅ Token canister get default test passed!");
        },
        Ok(WasmResult::Reject(msg)) => panic!("Get token canister rejected: {}", msg),
        Err(e) => panic!("Get token canister failed: {:?}", e),
    }
}

#[test]
fn test_token_canister_set_and_get() {
    let pic = PocketIc::new();
    
    let staking_canister = pic.create_canister();
    pic.add_cycles(staking_canister, 2_000_000_000_000); // 2T cycles
    let staking_wasm = std::fs::read(STAKING_WASM_PATH)
        .expect("Could not read staking WASM file");
    pic.install_canister(staking_canister, staking_wasm, vec![], None);
    
    // Use a simple, known-valid principal
    let new_token_principal = Principal::from_text("2chl6-4hpzw-vqaaa-aaaaa-c").unwrap();
    
    // Set token canister
    let result = pic.update_call(
        staking_canister,
        Principal::anonymous(),
        "set_token_canister",
        encode_args((new_token_principal,)).unwrap(),
    );
    
    match result {
        Ok(WasmResult::Reply(_)) => {
            println!("✅ Successfully set token canister");
            
            // Verify by getting it
            let result = pic.query_call(
                staking_canister,
                Principal::anonymous(),
                "get_token_canister",
                encode_args(()).unwrap(),
            );
            
            match result {
                Ok(WasmResult::Reply(bytes)) => {
                    let retrieved_canister: Principal = decode_one(&bytes).unwrap();
                    assert_eq!(retrieved_canister, new_token_principal);
                    println!("✅ Token canister set and get test passed!");
                },
                Ok(WasmResult::Reject(msg)) => panic!("Get token canister rejected: {}", msg),
                Err(e) => panic!("Get token canister failed: {:?}", e),
            }
        },
        Ok(WasmResult::Reject(msg)) => panic!("Set token canister rejected: {}", msg),
        Err(e) => panic!("Set token canister failed: {:?}", e),
    }
}
