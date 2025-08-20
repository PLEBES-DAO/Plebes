cargo build --release --target wasm32-unknown-unknown --package backend_backend


candid-extractor target/wasm32-unknown-unknown/release/backend_backend.wasm > backend_backend.did

rm -rf ./backend/src/backend_backend/backend_backend.did

 mv backend_backend.did ./backend/src/backend_backend/