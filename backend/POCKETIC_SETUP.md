# PocketIC Setup Instructions

## Prerequisites for Running PocketIC Tests

Before running the PocketIC integration tests, you need to set up the test environment:

### 1. Download PocketIC Binary

Download the PocketIC binary from the official repository:

```bash
# For macOS (Intel)
curl -sLO https://github.com/dfinity/pocketic/releases/latest/download/pocket-ic-x86_64-darwin.gz
gunzip pocket-ic-x86_64-darwin.gz
chmod +x pocket-ic-x86_64-darwin
mv pocket-ic-x86_64-darwin pocket-ic

# For macOS (Apple Silicon)
curl -sLO https://github.com/dfinity/pocketic/releases/latest/download/pocket-ic-aarch64-darwin.gz
gunzip pocket-ic-aarch64-darwin.gz
chmod +x pocket-ic-aarch64-darwin
mv pocket-ic-aarch64-darwin pocket-ic

# For Linux
curl -sLO https://github.com/dfinity/pocketic/releases/latest/download/pocket-ic-x86_64-linux.gz
gunzip pocket-ic-x86_64-linux.gz
chmod +x pocket-ic-x86_64-linux
mv pocket-ic-x86_64-linux pocket-ic
```

Place the `pocket-ic` binary in your project root or set the `POCKET_IC_BIN` environment variable.

### 2. Build the Staking Canister WASM

The tests require the staking canister to be compiled to WASM:

```bash
cd backend/src/backend_backend
cargo build --target wasm32-unknown-unknown --release
```

This creates the WASM file at `target/wasm32-unknown-unknown/release/backend_backend.wasm`.

### 3. Run the Tests

```bash
# Run all PocketIC integration tests
cargo test --test pocket_ic_staking_tests

# Run simple PocketIC tests
cargo test --test simple_pocket_ic_test

# Run with output to see progress
cargo test --test pocket_ic_staking_tests -- --nocapture
```

## Test Coverage

- ✅ **7 passing tests** - Core functionality validation
- 🚧 **2 ignored tests** - Require mock ledger implementation

## Environment Variables

- `POCKET_IC_BIN`: Path to the PocketIC binary (optional if in PATH or current directory)

## Troubleshooting

If tests fail with "Could not find the PocketIC binary", ensure:
1. The binary is downloaded and executable
2. The binary is in your PATH or current directory
3. Or set `POCKET_IC_BIN` environment variable

## Dependencies

The tests use PocketIC version 3.1.0 for stability and compatibility.
