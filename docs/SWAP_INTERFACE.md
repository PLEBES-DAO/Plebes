# ICP ⇄ ckBTC Swap Interface

A comprehensive graphical interface for executing ICP to ckBTC swaps using the Internet Computer's decentralized swap pools.

## Overview

The SwapInterface component provides a user-friendly way to interact with the swap functionality found in the BioniqContext. It visualizes the entire swap process through an intuitive step-by-step interface with real-time progress tracking.

## Features

### 🎯 Core Functionality
- **One-click ICP to ckBTC swaps** - Convert all available ICP balance to ckBTC
- **Real-time progress tracking** - Visual indicators for each step of the swap process
- **Balance monitoring** - Live updates of ICP and ckBTC balances
- **Error handling** - Comprehensive error display with auto-dismiss
- **Token withdrawal** - Reclaim unused tokens from the swap pool

### 🎨 User Experience
- **Animated progress bars** - Smooth transitions and glow effects
- **Step completion animations** - Visual feedback for completed operations
- **Responsive design** - Works seamlessly on desktop and mobile
- **Loading states** - Skeleton screens and spinners for better UX
- **Confirmation modals** - Prevent accidental transactions

### 🔒 Security & Reliability
- **Wallet connection validation** - Ensures proper wallet setup before swaps
- **Balance verification** - Prevents swaps with insufficient funds
- **Transaction confirmation** - User approval required for all operations
- **Error recovery** - Graceful handling of failed operations

## Swap Process Flow

The swap interface follows the same 5-step process as the underlying `buy()` function:

```
1. Approve ICP    → Authorize tokens for trading
2. Deposit ICP    → Transfer ICP to swap pool  
3. Execute Swap   → Exchange ICP for ckBTC
4. Withdraw ckBTC → Claim your ckBTC tokens
5. Complete       → Swap successfully finished
```

### Step Details

#### Step 1: Approve ICP
- Calls the ICP canister to approve token spending
- Sets allowance for the swap pool contract
- Required for security - prevents unauthorized access

#### Step 2: Deposit ICP  
- Transfers user's ICP balance to the swap pool
- Accounts for transaction fees automatically
- Creates pool deposit record

#### Step 3: Execute Swap
- Gets current pool rates and calculates output
- Performs the actual token exchange
- Uses automated market maker logic

#### Step 4: Withdraw ckBTC
- Claims the converted ckBTC tokens
- Withdraws any unused tokens from pool
- Updates user's wallet balances

#### Step 5: Complete
- Finalizes the transaction
- Refreshes all balance displays
- Resets swap state for new transactions

## Implementation Details

### File Structure
```
src/
├── components/swap/
│   ├── SwapInterface.jsx      # Main component
│   └── SwapInterface.css      # Animations & styles
├── app/(pages)/swap/
│   └── page.jsx              # Swap page with layout
└── hooks/
    └── BioniqContext.jsx     # Core swap logic
```

### Key Components

#### SwapInterface.jsx
The main React component that renders the swap interface:

```jsx
import SwapInterface from "../../components/swap/SwapInterface";

// Usage in a page
<SwapInterface />
```

#### Key State Variables
- `icpBalanceValue` - Current ICP balance
- `ckBTCBalance` - Current ckBTC balance  
- `swapStep` - Current step in swap process (0-5)
- `loading` - Loading state for operations
- `error` - Error messages and handling
- `showConfirmModal` - Confirmation dialog state

#### Core Functions
- `loadBalances()` - Fetches current token balances
- `handleSwapInitiate()` - Validates and starts swap process
- `handleConfirmSwap()` - Executes the actual swap
- `handleWithdrawTokens()` - Withdraws unused tokens

### Swap Logic Integration

The interface integrates with BioniqContext functions:

```jsx
const { 
  wallets,          // Wallet connection info
  balances,         // Token balances array
  buy,              // Main swap function
  withdraw,         // Withdraw unused tokens
  swapStep,         // Current step (0-5)
  setSwapStep,      // Step setter
  loading,          // Loading state
  error,            // Error state
  resetError,       // Error reset function
  icpBalance        // ICP balance getter
} = useBioniqContext();
```

### Animation System

The interface uses CSS animations for enhanced UX:

- **Pulse animations** - Active step indicators
- **Progress glows** - Animated progress bars
- **Step completion** - Success state transitions
- **Error shake** - Error state feedback
- **Modal entrance** - Smooth modal appearances
- **Loading skeletons** - Better loading states

## Usage Guide

### Prerequisites
1. **Wallet Connection** - User must connect their Internet Computer wallet
2. **ICP Balance** - Must have ICP tokens to swap
3. **Network Access** - Connection to Internet Computer network

### Starting a Swap

1. **Navigate to Swap Page** - `/swap` route
2. **Verify Wallet Connection** - Green indicator shows connected status
3. **Check ICP Balance** - Ensure sufficient funds for swap
4. **Click "Start ICP → ckBTC Swap"** - Initiates the process
5. **Confirm Transaction** - Review details in confirmation modal
6. **Monitor Progress** - Watch real-time step completion

### Error Handling

Common errors and solutions:

- **"Wallet Not Connected"** - Connect wallet using login button
- **"Insufficient ICP Balance"** - Add more ICP tokens to wallet
- **"Transaction Failed"** - Check network connection, try again
- **"Pool Error"** - Swap pool may be temporarily unavailable

### Post-Swap Actions

After successful swap:
- **Check ckBTC Balance** - New tokens appear in balance display
- **Withdraw Unused Tokens** - Reclaim any leftover pool deposits
- **Start New Swap** - Interface resets for additional swaps

## Technical Integration

### Adding to Existing Pages

```jsx
import SwapInterface from "../../../components/swap/SwapInterface";

export default function MyPage() {
  return (
    <div>
      <h1>My DeFi Page</h1>
      <SwapInterface />
    </div>
  );
}
```

### Custom Styling

Override default styles by importing after the component:

```jsx
import SwapInterface from "./SwapInterface";
import "./my-custom-styles.css"; // Your overrides
```

### Event Handling

Listen to swap events via BioniqContext:

```jsx
useEffect(() => {
  if (swapStep === 5) {
    // Swap completed - update UI
    showSuccessNotification();
  }
}, [swapStep]);
```

## API Reference

### Props
The SwapInterface component doesn't accept props - it gets all data from BioniqContext.

### Methods (via Context)
- `buy()` - Execute ICP to ckBTC swap
- `withdraw()` - Withdraw unused tokens from pool
- `icpBalance()` - Get current ICP balance
- `resetError()` - Clear error states

### State Variables (via Context)
- `swapStep: number` - Current step (0-5)
- `loading: boolean` - Operation in progress
- `error: string | null` - Error message
- `wallets: object` - Wallet connection info
- `balances: array` - Token balance array

## Performance Considerations

### Optimization Strategies
- **Lazy loading** - Component loads only when needed
- **Memoized calculations** - Balance formatting cached
- **Efficient re-renders** - Minimal state updates
- **Background updates** - Non-blocking balance refreshes

### Memory Management
- **Event cleanup** - Removes timers and listeners
- **State reset** - Clears completed swap data
- **Error auto-dismiss** - Prevents memory leaks

## Browser Compatibility

### Supported Browsers
- Chrome 90+ ✅
- Firefox 88+ ✅  
- Safari 14+ ✅
- Edge 90+ ✅

### Mobile Support
- iOS Safari 14+ ✅
- Chrome Mobile 90+ ✅
- Samsung Internet 15+ ✅

## Future Enhancements

### Planned Features
- **Multi-token swaps** - Support for additional token pairs
- **Price impact display** - Show swap rate effects
- **Transaction history** - Log of completed swaps
- **Advanced settings** - Slippage tolerance, deadlines
- **Gas optimization** - Batch transactions for efficiency

### Customization Options
- **Theme variants** - Dark/light mode support
- **Layout options** - Compact/expanded views
- **Language support** - Internationalization ready
- **Custom animations** - Configurable animation preferences

## Troubleshooting

### Common Issues

**Q: Swap gets stuck on step 3**
A: Check Internet Computer network status, try refreshing the page

**Q: Balance not updating after swap**
A: Click "Refresh Balances" button or wait for automatic update

**Q: Transaction failed with unknown error**
A: Check browser console for detailed error messages

**Q: Mobile interface not responsive**
A: Clear browser cache and reload page

### Debug Mode

Enable debug logging:
```jsx
// Add to console before using interface
window.swapDebug = true;
```

This will log detailed information about swap progress and errors.

## Support

For technical support:
- 📧 Email: dev@plebes.xyz
- 🐛 Issues: GitHub repository
- 💬 Discord: Community support channel
- 📖 Docs: Full documentation site 