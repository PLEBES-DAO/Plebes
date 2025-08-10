<div align="center">
  <img src="https://raw.githubusercontent.com/PLEBES-DAO/Plebes/main/public/img/logo.png" alt="PLEBES DAO Logo" width="200" height="200">
  
  # Welcome to PLEBES DAO! 
  
  <p><strong>Empowering the community through decentralized staking and governance on the Internet Computer</strong></p>
  
  [![GitHub](https://img.shields.io/badge/GitHub-PLEBES--DAO-blue?style=flat-square&logo=github)](https://github.com/PLEBES-DAO)
  [![IC](https://img.shields.io/badge/Internet-Computer-29ABE2?style=flat-square&logo=internet-computer)](https://internetcomputer.org/)
  [![Rust](https://img.shields.io/badge/Built%20with-Rust-orange?style=flat-square&logo=rust)](https://www.rust-lang.org/)
  [![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
</div>

This is the official repository for **PLEBES DAO**. We are a decentralized autonomous organization (DAO) focused on empowering the community and driving innovation in the blockchain space through our native staking platform.

## 📖 **Plebes Deck: Read All About Us!**

Curious about what we do, our mission, and our vision? Dive into the **Plebes Deck** to learn everything about PLEBES DAO!

👉 [**Read the Plebes Deck PDF here**](https://github.com/PLEBES-DAO/Plebes/blob/main/PlebesDeck.pdf)

## 🏗️ **Project Architecture**

### Frontend (React + Vite)
- **Location**: `/src/`
- **Framework**: React with Vite for fast development
- **Styling**: Modern CSS with responsive design
- **IC Integration**: Agent-js for seamless canister communication

### Backend (Rust Canisters)
- **Location**: `/backend/src/backend_backend/`
- **Language**: Rust with IC CDK
- **Features**: ICRC-2 compatible staking system with rewards
- **Testing**: Comprehensive unit tests + PocketIC integration tests

## 💰 **PLEBES Staking Platform**

Our platform features a sophisticated staking system built on the Internet Computer:

### ✨ **Key Features**
- **🔒 Secure Staking**: Lock your PLEBES tokens for rewards
- **⏰ Flexible Lockup**: 30-day lockup period with daily rewards
- **🔄 Auto-Compounding**: Optional reward compounding
- **📊 Real-time Stats**: Live protocol metrics and user balances
- **💎 Bonus Rewards**: Special bonuses for early stakers

### 🛠️ **Technical Specifications**
- **Token Standard**: ICRC-2 compatible
- **Reward Rate**: 1 token per day per staked token
- **Lockup Period**: 30 days
- **Start Bonus**: 100 tokens for new stakers
- **Architecture**: Secure subaccount-based token management

### 📈 **Staking Functions**
- `stake(amount)` - Stake tokens with approval
- `start_staking()` - Get bonus tokens and start staking
- `withdraw()` - Withdraw unlocked tokens after lockup
- `compound_rewards()` - Reinvest rewards for higher yields
- `my_staking_balance()` - Check your staking position
- `get_protocol_stats()` - View total protocol metrics

## 🧪 **Testing & Quality Assurance**

### Unit Tests
```bash
# Run all Rust unit tests
cd backend/src/backend_backend
cargo test
```

### PocketIC Integration Tests
We use **PocketIC** for realistic Internet Computer integration testing:

```bash
# Setup PocketIC (one-time)
curl -sLO https://github.com/dfinity/pocketic/releases/latest/download/pocket-ic-aarch64-darwin.gz
gunzip pocket-ic-aarch64-darwin.gz
chmod +x pocket-ic-aarch64-darwin
mv pocket-ic-aarch64-darwin pocket-ic

# Build canister WASM
cargo build --target wasm32-unknown-unknown --release

# Run integration tests
cargo test --test pocket_ic_staking_tests -- --nocapture
```

**Test Coverage**: 7/9 tests passing with comprehensive validation:
- ✅ Token canister configuration
- ✅ Input validation and error handling
- ✅ Protocol state management
- ✅ Time advancement simulation
- ✅ Staking workflow validation

## 🚀 **Getting Started**

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [Rust](https://rustup.rs/) with `wasm32-unknown-unknown` target
- [DFX](https://internetcomputer.org/docs/current/developer-docs/setup/install/) (Internet Computer SDK)

### Quick Start
```bash
# Clone the repository
git clone https://github.com/PLEBES-DAO/Plebes.git
cd Plebes

# Install dependencies
npm install

# Start local IC replica
dfx start --background

# Deploy canisters
dfx deploy

# Start frontend development server
npm run dev
```

## 🏛️ **About Us**

PLEBES DAO is built by the community, for the community. We believe in decentralization, transparency, and collective decision-making. Our staking platform represents the first step in creating a truly community-governed ecosystem on the Internet Computer.

### 🎯 **Our Mission**
- Democratize access to staking rewards
- Build transparent, community-driven protocols
- Foster innovation in the IC ecosystem
- Empower users through decentralized governance

## 🤝 **Get Involved**

- **💬 Join the conversation**: Connect with us on [Discord/Twitter/Telegram]
- **👨‍💻 Contribute**: Check out our open issues and start contributing
- **📢 Stay updated**: Follow our GitHub repository for latest updates
- **🧪 Test**: Help us test the staking platform on testnet
- **🐛 Report bugs**: Found an issue? Create a GitHub issue

## 📚 **Documentation**

- [📋 PocketIC Test Summary](backend/POCKETIC_TESTS_SUMMARY.md)
- [⚙️ PocketIC Setup Guide](backend/POCKETIC_SETUP.md)
- [🔧 Staking Contract Documentation](backend/src/backend_backend/src/lib.rs)

---

<div align="center">
  <p><strong>Let's build the future together!</strong> 🚀</p>
  <p><em>Powered by the Internet Computer • Built with Rust & React • Tested with PocketIC</em></p>
</div>
