# Plebes Frontend Backend

Welcome to the Plebes Frontend backend canister! This project implements a comprehensive staking and token burn system on the Internet Computer (IC). The backend provides staking rewards, anti-fragmentation burn mechanics, and query functions for frontend integration.

## Features

### 🔒 Staking System
- **Token Staking**: Users can stake tokens with lockup periods
- **Reward Distribution**: Automatic reward calculation and distribution
- **Staking Management**: Start, stop, and manage staking positions
- **Time-based Lockups**: Configurable lockup periods for staked tokens

### 🔥 Token Burn System (ULTRA-MVP)
- **80/20 Burn Split**: 80% of tokens burned permanently, 20% sent to treasury
- **Anti-fragmentation Rules**: Prevents small, frequent burns that could fragment the token supply
- **Attempt Tracking**: Monitors burn attempts and implements lockout periods
- **Eligibility Checks**: Smart validation for burn eligibility
- **Demo Mode**: Testing mode for development and demonstrations

### 📊 Query Functions
- **Burn Statistics**: Global burn metrics and history
- **User Burn History**: Individual user burn event tracking  
- **Eligibility Status**: Real-time burn eligibility checking
- **Attempt Monitoring**: Track anti-fragmentation attempt counts
- **Staking Info**: View current staking positions and rewards

To get started, you might want to explore the project directory structure and the default configuration file. Working with this project in your development environment will not affect any production deployment or identity tokens.

To learn more before you start working with `backend`, see the following documentation available online:

- [Quick Start](https://internetcomputer.org/docs/current/developer-docs/setup/deploy-locally)
- [SDK Developer Tools](https://internetcomputer.org/docs/current/developer-docs/setup/install)
- [Rust Canister Development Guide](https://internetcomputer.org/docs/current/developer-docs/backend/rust/)
- [ic-cdk](https://docs.rs/ic-cdk)
- [ic-cdk-macros](https://docs.rs/ic-cdk-macros)
- [Candid Introduction](https://internetcomputer.org/docs/current/developer-docs/backend/candid/)

If you want to start working on your project right away, you might want to try the following commands:

```bash
cd backend/
dfx help
dfx canister --help
```

## Running the project locally

If you want to test your project locally, you can use the following commands:

```bash
# Starts the replica, running in the background
dfx start --background

# Deploys your canisters to the replica and generates your candid interface
dfx deploy
```

Once the job completes, your application will be available at `http://localhost:4943?canisterId={asset_canister_id}`.

If you have made changes to your backend canister, you can generate a new candid interface with

```bash
npm run generate
```

at any time. This is recommended before starting the frontend development server, and will be run automatically any time you run `dfx deploy`.

If you are making frontend changes, you can start a development server with

```bash
npm start
```

Which will start a server at `http://localhost:8080`, proxying API requests to the replica at port 4943.

## Codebase Structure

The backend is implemented in Rust and organized into several key files:

```
src/backend_backend/
├── src/
│   ├── lib.rs            # Main entry point and canister methods
│   ├── state.rs          # State management and data structures
│   ├── ledger.rs         # Token ledger interface
│   └── utils.rs          # Utility functions
└── tests/
    ├── burn_pocket_ic_tests.rs       # Burn functionality integration tests
    ├── pocket_ic_staking_tests.rs    # Staking integration tests
    ├── state_tests.rs                # State management unit tests
    └── staking_tests.rs              # Staking unit tests
```

## Implementation Details

### Staking System

The staking system allows users to:

1. **Start Staking**: Users can stake tokens, which are locked for a configurable period
2. **Earn Rewards**: Stakers earn rewards based on their stake amount and duration
3. **Manage Stake**: Users can add to their stake or stop staking after the lockup period

Staking data is maintained in the canister state, with rewards calculated based on time elapsed and stake amount.

### Burn Functionality

The burn functionality implements the ULTRA-MVP specification:

1. **Eligibility Check**: Users must have active stake to burn tokens
2. **80/20 Split**: 80% of tokens are permanently burned, 20% go to the treasury
3. **Anti-Fragmentation**: Rules prevent small, frequent burns:
   - Minimum burn amounts enforced
   - Tracking of small burn attempts
   - Lockout periods for users who make too many small attempts
4. **Event Logging**: All burn events are recorded in the state

### Query Methods

The canister exposes several query methods for the frontend:

```rust
// Burn-specific queries
get_burn_eligibility(principal: Principal) -> bool
get_burn_stats() -> BurnStats
get_user_burn_history(principal: Principal) -> Vec<BurnEvent>
get_attempt_status(principal: Principal) -> Attempts
get_demo_burn_mode() -> bool

// Staking queries
get_staker(principal: Principal) -> Option<StakerInfo>
get_staking_stats() -> StakingStats
```

## Testing

The codebase includes comprehensive test coverage:

### Unit Tests

Unit tests verify the core functionality of state management and calculations:

```bash
# Run unit tests
cargo test state_tests staking_tests
```

### Integration Tests with Pocket IC

Integration tests use the Pocket IC framework to simulate a complete IC environment:

```bash
# Run integration tests for burn functionality
cargo test burn_pocket_ic_tests

# Run integration tests for staking functionality
cargo test pocket_ic_staking_tests
```

The burn tests validate:
- Successful burn operations with 80/20 split
- Burn attempts without prior stake
- Anti-fragmentation rules and lockout periods
- Frontend query functions
- Error message validation

The staking tests cover:
- Starting and stopping staking
- Reward calculations
- Lockup period enforcement
- Staking statistics

## API Reference

### Update Methods (require authentication)

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `burn_tokens` | `amount: Nat` | `Result<BurnResult, StakingError>` | Burns tokens with 80/20 split |
| `start_staking` | - | `Result<Nat, StakingError>` | Begins staking for the caller |
| `stop_staking` | - | `Result<Nat, StakingError>` | Stops staking and returns rewards |
| `set_demo_burn_mode` | `enabled: bool` | - | Enables/disables demo mode (admin only) |
| `set_token_canister` | `canister_id: Principal` | - | Sets the token ledger canister |

### Query Methods (read-only)

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `get_burn_eligibility` | `user: Principal` | `bool` | Checks if user can burn tokens |
| `get_burn_stats` | - | `BurnStats` | Global burn statistics |
| `get_user_burn_history` | `user: Principal` | `Vec<BurnEvent>` | User's burn event history |
| `get_attempt_status` | `user: Principal` | `Attempts` | Anti-fragmentation attempt status |
| `get_demo_burn_mode` | - | `bool` | Current demo mode status |
| `get_staker` | `user: Principal` | `Option<StakerInfo>` | User's staking information |
| `get_staking_stats` | - | `StakingStats` | Global staking statistics |

### Data Types

```rust
// Burn-related types
pub struct BurnResult {
    pub burned: Nat,      // Amount permanently burned (80%)
    pub to_treasury: Nat, // Amount sent to treasury (20%)
}

pub struct BurnStats {
    pub total_burned: Nat,
    pub total_to_treasury: Nat,
    pub total_burn_events: u64,
}

pub struct BurnEvent {
    pub amount: Nat,      // Original burn amount
    pub burned: Nat,      // Amount burned (80%)
    pub treasury: Nat,    // Amount to treasury (20%)
    pub block_index: Nat, // Ledger block index
    pub created_at: u64,  // Timestamp
}

pub struct Attempts {
    pub win_start: u64,    // Window start time
    pub small_cnt: u64,    // Small attempt count
    pub total_cnt: u64,    // Total attempt count
    pub lockout_until: u64, // Lockout end time
}

// Staking-related types  
pub struct StakerInfo {
    pub staked_amount: Nat,
    pub reward_amount: Nat,
    pub start_time: u64,
    pub is_staking: bool,
}

pub struct StakingStats {
    pub total_stakers: u64,
    pub total_staked: Nat,
    pub total_rewards_distributed: Nat,
}
```

## Development Workflow

### 1. Development Setup

```bash
# Install dependencies
rustup target add wasm32-unknown-unknown
cargo install --version 0.20.1 dfx

# Start local IC replica
dfx start --background --clean
```

### 2. Build and Deploy

```bash
# Build the canister
cargo build --target wasm32-unknown-unknown --release

# Deploy to local replica
dfx deploy
```

### 3. Testing

```bash
# Run all tests
cargo test

# Run specific test suites
cargo test --test burn_pocket_ic_tests     # Burn functionality
cargo test --test pocket_ic_staking_tests  # Staking functionality
cargo test state_tests                     # State management
cargo test staking_tests                   # Staking unit tests
```

### 4. Candid Interface Generation

The Candid interface is automatically generated during deployment:

```bash
dfx generate
```

This creates TypeScript declarations in `src/declarations/` for frontend integration.

## Building

To build the canister WASM:

```bash
cargo build --target wasm32-unknown-unknown --release
```

The compiled WASM file will be located at:
```
target/wasm32-unknown-unknown/release/backend_backend.wasm
```

### Note on frontend environment variables

If you are hosting frontend code somewhere without using DFX, you may need to make one of the following adjustments to ensure your project does not fetch the root key in production:

- set`DFX_NETWORK` to `ic` if you are using Webpack
- use your own preferred method to replace `process.env.DFX_NETWORK` in the autogenerated declarations
  - Setting `canisters -> {asset_canister_id} -> declarations -> env_override to a string` in `dfx.json` will replace `process.env.DFX_NETWORK` with the string in the autogenerated declarations
- Write your own `createActor` constructor
