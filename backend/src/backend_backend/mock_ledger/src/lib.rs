use candid::{CandidType, Nat, Principal};
use ic_cdk_macros::{update, query, init};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use icrc_ledger_types::icrc1::account::Account;
use icrc_ledger_types::icrc1::transfer::{TransferArg, TransferError};
use icrc_ledger_types::icrc2::transfer_from::{TransferFromArgs, TransferFromError};

// Simplified mock ledger state
thread_local! {
    static BALANCES: std::cell::RefCell<HashMap<Principal, Nat>> = std::cell::RefCell::new(HashMap::new());
    static ALLOWANCES: std::cell::RefCell<HashMap<(Principal, Principal), Nat>> = std::cell::RefCell::new(HashMap::new());
    static BLOCK_INDEX: std::cell::RefCell<u64> = std::cell::RefCell::new(0);
}

#[derive(CandidType, Deserialize, Debug)]
pub struct ApproveArgs {
    pub spender: Principal,
    pub amount: Nat,
}

#[init]
fn init() {
    // Initialize with some default state if needed
}

// Mock ICRC-1 transfer function
#[update]
fn icrc1_transfer(args: TransferArg) -> Result<Nat, TransferError> {
    let from = ic_cdk::caller();
    let to = args.to.owner;
    let amount = args.amount;
    
    BALANCES.with(|balances| {
        let mut balances = balances.borrow_mut();
        
        let from_balance = balances.get(&from).cloned().unwrap_or(Nat::from(0u64));
        if from_balance < amount {
            return Err(TransferError::InsufficientFunds {
                balance: from_balance
            });
        }
        
        // Update balances
        balances.insert(from, from_balance - amount.clone());
        let to_balance = balances.get(&to).cloned().unwrap_or(Nat::from(0u64));
        balances.insert(to, to_balance + amount);
        
        // Increment block index
        BLOCK_INDEX.with(|idx| {
            let mut idx = idx.borrow_mut();
            *idx += 1;
            Ok(Nat::from(*idx))
        })
    })
}

// Mock ICRC-2 transfer_from function
#[update] 
fn icrc2_transfer_from(args: TransferFromArgs) -> Result<Nat, TransferFromError> {
    let spender = ic_cdk::caller();
    let from = args.from.owner;
    let to = args.to.owner;
    let amount = args.amount;
    
    // Check allowance
    let allowance_key = (from, spender);
    let allowance = ALLOWANCES.with(|allowances| {
        allowances.borrow().get(&allowance_key).cloned().unwrap_or(Nat::from(0u64))
    });
    
    if allowance < amount {
        return Err(TransferFromError::InsufficientAllowance {
            allowance
        });
    }
    
    BALANCES.with(|balances| {
        let mut balances = balances.borrow_mut();
        
        let from_balance = balances.get(&from).cloned().unwrap_or(Nat::from(0u64));
        if from_balance < amount {
            return Err(TransferFromError::InsufficientFunds {
                balance: from_balance
            });
        }
        
        // Update balances
        balances.insert(from, from_balance - amount.clone());
        let to_balance = balances.get(&to).cloned().unwrap_or(Nat::from(0u64));
        balances.insert(to, to_balance + amount.clone());
        
        // Update allowance
        ALLOWANCES.with(|allowances| {
            let mut allowances = allowances.borrow_mut();
            allowances.insert(allowance_key, allowance - amount);
        });
        
        // Increment block index
        BLOCK_INDEX.with(|idx| {
            let mut idx = idx.borrow_mut();
            *idx += 1;
            Ok(Nat::from(*idx))
        })
    })
}

// Mock ICRC-1 balance_of function
#[query]
fn icrc1_balance_of(account: Account) -> Nat {
    BALANCES.with(|balances| {
        balances.borrow().get(&account.owner).cloned().unwrap_or(Nat::from(0u64))
    })
}

// Mock ICRC-2 approve function
#[update]
fn icrc2_approve(args: ApproveArgs) -> Result<Nat, String> {
    let owner = ic_cdk::caller();
    let spender = args.spender;
    let amount = args.amount;
    
    ALLOWANCES.with(|allowances| {
        let mut allowances = allowances.borrow_mut();
        allowances.insert((owner, spender), amount);
    });
    
    BLOCK_INDEX.with(|idx| {
        let mut idx = idx.borrow_mut();
        *idx += 1;
        Ok(Nat::from(*idx))
    })
}

// Test helper functions
#[update]
fn mint(to: Principal, amount: Nat) {
    // Only for testing - mint tokens to an account
    BALANCES.with(|balances| {
        let mut balances = balances.borrow_mut();
        let current_balance = balances.get(&to).cloned().unwrap_or(Nat::from(0u64));
        balances.insert(to, current_balance + amount);
    });
}

#[query]
fn balance(account: Principal) -> Nat {
    BALANCES.with(|balances| {
        balances.borrow().get(&account).cloned().unwrap_or(Nat::from(0u64))
    })
}

#[update]
fn approve(spender: Principal, amount: Nat) {
    let owner = ic_cdk::caller();
    ALLOWANCES.with(|allowances| {
        let mut allowances = allowances.borrow_mut();
        allowances.insert((owner, spender), amount);
    });
}

#[query]
fn allowance(owner: Principal, spender: Principal) -> Nat {
    ALLOWANCES.with(|allowances| {
        allowances.borrow().get(&(owner, spender)).cloned().unwrap_or(Nat::from(0u64))
    })
}

ic_cdk::export_candid!();
