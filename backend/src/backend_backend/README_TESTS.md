# Staking Contract Unit Tests

This directory contains unit tests for the staking functionality, focusing on testing the core data structures and business logic without requiring full canister deployment.

## Test Structure

The tests are organized into several modules:

### 1. `tests/staking_tests.rs`
- Basic unit tests for staking functionality
- Tests data structure creation and manipulation
- Error type testing and validation
- Basic calculations and time operations
- Principal creation and handling

### 2. `tests/state_tests.rs`
- Unit tests for state management data structures
- Tests StakerData, UnlockEvent, and ProtocolStats
- Data structure operations and cloning
- Time-based logic testing
- Large number handling

## Prerequisites

1. **Rust and Cargo**: Make sure you have Rust installed
2. **Basic Dependencies**: The tests only require standard Rust libraries and candid
   - No WASM compilation needed for unit tests
   - No PocketIC setup required

## Running the Tests

### All Tests
```bash
cargo test
```

### Specific Test Modules
```bash
# Run only basic staking tests
cargo test staking_tests

# Run only state management tests
cargo test state_tests
```

### Specific Test Functions
```bash
# Test protocol stats creation
cargo test test_protocol_stats_creation

# Test staking error types
cargo test test_staking_error_types

# Test time calculations
cargo test test_time_calculations
```

### With Output
```bash
# Show println! output during tests
cargo test -- --nocapture
```

## Test Coverage

The tests cover the following areas:

### Core Data Types
- ✅ `StakingError` - Error type creation, cloning, and matching
- ✅ `StakingInfo` - Staking information structure
- ✅ `ProtocolStats` - Protocol statistics structure
- ✅ `StakerData` - Individual staker data structure
- ✅ `UnlockEvent` - Unlock event structure

### Basic Operations
- ✅ Principal creation and validation
- ✅ Nat (big integer) arithmetic operations
- ✅ Time calculations and lockup period logic
- ✅ Large number handling (up to u64::MAX)
- ✅ Data structure cloning and equality

### Business Logic
- ✅ Reward calculation formulas
- ✅ Lockup period validation
- ✅ Time-based unlock logic
- ✅ Constants validation (rates, periods, bonuses)

## Test Approach

These are pure unit tests that:
- Focus on data structure correctness
- Test business logic calculations
- Validate error handling patterns
- Don't require canister deployment
- Run quickly without external dependencies

## Extending the Tests

To add new tests:

1. Add test functions to the appropriate module using `#[test]`
2. Follow the existing patterns for data structure testing
3. Use `assert_eq!`, `assert_ne!`, and other standard assertions

Example new test:
```rust
#[test]
fn test_my_new_feature() {
    let data = create_test_data(100);
    
    // Your test logic here
    assert_eq!(data.field, expected_value);
}
```

## Future Enhancements

For more comprehensive testing, consider adding:
1. **Integration Tests**: Use PocketIC to test actual canister functions
2. **Property-Based Tests**: Use `proptest` for randomized input testing
3. **Mock Ledger**: Implement full ICRC-1 mock for end-to-end testing
4. **Performance Tests**: Benchmark critical operations
