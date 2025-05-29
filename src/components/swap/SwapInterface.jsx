import React, { useState, useEffect } from "react";
import { FaCheck, FaSpinner, FaExchangeAlt, FaWallet, FaCoins } from "react-icons/fa";
import { useBioniqContext } from "../../hooks/BioniqContext";
import "./SwapInterface.css";

const SwapInterface = () => {
  const { 
    wallets, 
    balances, 
    buy, 
    withdraw, 
    swapStep, 
    setSwapStep, 
    loading, 
    error, 
    resetError,
    icpBalance
  } = useBioniqContext();

  const [icpBalanceValue, setIcpBalanceValue] = useState(null);
  const [ckBTCBalance, setCkBTCBalance] = useState(null);
  const [loadingBalances, setLoadingBalances] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [estimatedOutput, setEstimatedOutput] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // Swap steps configuration
  const swapSteps = [
    { 
      id: 1, 
      title: "Approve ICP", 
      description: "Authorize ICP tokens for trading",
      icon: <FaCheck />,
      color: "bg-blue-500"
    },
    { 
      id: 2, 
      title: "Deposit ICP", 
      description: "Transfer ICP to swap pool",
      icon: <FaWallet />,
      color: "bg-green-500"
    },
    { 
      id: 3, 
      title: "Execute Swap", 
      description: "Exchange ICP for ckBTC",
      icon: <FaExchangeAlt />,
      color: "bg-purple-500"
    },
    { 
      id: 4, 
      title: "Withdraw ckBTC", 
      description: "Claim your ckBTC tokens",
      icon: <FaCoins />,
      color: "bg-orange-500"
    },
    { 
      id: 5, 
      title: "Complete", 
      description: "Swap successfully finished",
      icon: <FaCheck />,
      color: "bg-emerald-500"
    },
  ];

  // Load balances on component mount
  useEffect(() => {
    loadBalances();
  }, [wallets, icpBalance]);

  // Track completed steps for animations
  useEffect(() => {
    if (swapStep > 0 && !completedSteps.has(swapStep - 1) && swapStep > 1) {
      setCompletedSteps(prev => new Set([...prev, swapStep - 1]));
    }
  }, [swapStep, completedSteps]);

  // Reset error when component unmounts or swapStep changes
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        resetError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, resetError]);

  // Reset completed steps when starting new swap
  useEffect(() => {
    if (swapStep === 0) {
      setCompletedSteps(new Set());
    }
  }, [swapStep]);

  const loadBalances = async () => {
    if (!wallets?.ckBTC?.credentials?.identity || !icpBalance) return;
    
    setLoadingBalances(true);
    try {
      // Load ICP balance
      const icpBal = await icpBalance();
      setIcpBalanceValue(icpBal);

      // Find ckBTC balance from balances array
      if (balances) {
        const ckBTCBal = balances.find(bal => 
          bal.tokenType === "ckBTC" || bal.tokenType?.toLowerCase() === "ckbtc"
        );
        setCkBTCBalance(ckBTCBal?.decimalAmount || 0);
      }
    } catch (error) {
      console.error('Error loading balances:', error);
    } finally {
      setLoadingBalances(false);
    }
  };

  const handleSwapInitiate = () => {
    if (!wallets?.ckBTC?.walletAddressForDisplay) {
      alert("Please connect your wallet first");
      return;
    }

    if (!icpBalanceValue || icpBalanceValue <= 0) {
      alert("Insufficient ICP balance for swap");
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmSwap = async () => {
    setShowConfirmModal(false);
    try {
      await buy();
    } catch (error) {
      console.error("Swap failed:", error);
    }
  };

  const handleWithdrawTokens = async () => {
    try {
      await withdraw();
    } catch (error) {
      console.error("Withdraw failed:", error);
    }
  };

  const getStepStatus = (stepId) => {
    if (stepId < swapStep) return "completed";
    if (stepId === swapStep) return "active";
    return "pending";
  };

  const getProgressPercentage = () => {
    return swapStep === 0 ? 0 : ((swapStep - 1) / 4) * 100;
  };

  const isStepCompleted = (stepId) => {
    return completedSteps.has(stepId) || stepId < swapStep;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-jacarta-800 rounded-lg shadow-xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 munro-regular-heading gradient-text">
          ICP ⇄ ckBTC Swap
        </h2>
        <p className="text-jacarta-300 munro-small-text">
          Exchange your ICP tokens for ckBTC using the decentralized swap pool
        </p>
      </div>

      {/* Wallet Connection Status */}
      <div className="mb-6 p-4 rounded-lg border-2 border-jacarta-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
              wallets?.ckBTC?.walletAddressForDisplay ? 'bg-green-500 pulse' : 'bg-red-500'
            }`}></div>
            <span className="text-white munro-small-text">
              {wallets?.ckBTC?.walletAddressForDisplay 
                ? 'Wallet Connected' 
                : 'Wallet Not Connected'}
            </span>
          </div>
          {wallets?.ckBTC?.walletAddressForDisplay && (
            <span className="text-jacarta-300 text-sm munro-small-text">
              {wallets.ckBTC.walletAddressForDisplay.slice(0, 10)}...
              {wallets.ckBTC.walletAddressForDisplay.slice(-8)}
            </span>
          )}
        </div>
      </div>

      {/* Balance Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-jacarta-700 p-4 rounded-lg balance-card">
          <div className="flex items-center justify-between">
            <span className="text-jacarta-300 munro-small-text">ICP Balance</span>
            {loadingBalances && <FaSpinner className="animate-spin text-blue-400" />}
          </div>
          <div className="text-2xl font-bold text-white munro-narrow">
            {icpBalanceValue !== null ? `${icpBalanceValue.toFixed(6)} ICP` : 
             loadingBalances ? <div className="skeleton h-8 w-32 rounded"></div> : '--'}
          </div>
        </div>
        
        <div className="bg-jacarta-700 p-4 rounded-lg balance-card">
          <div className="flex items-center justify-between">
            <span className="text-jacarta-300 munro-small-text">ckBTC Balance</span>
            {loadingBalances && <FaSpinner className="animate-spin text-orange-400" />}
          </div>
          <div className="text-2xl font-bold text-white munro-narrow">
            {ckBTCBalance !== null ? `${ckBTCBalance.toFixed(8)} ckBTC` : 
             loadingBalances ? <div className="skeleton h-8 w-32 rounded"></div> : '--'}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {swapStep > 0 && (
        <div className="mb-8">
          <div className="w-full bg-jacarta-600 rounded-full h-3 mb-4">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ease-in-out ${
                swapStep === 5 ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-purple-500 progress-glow'
              }`}
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
          <div className="text-center text-jacarta-300 munro-small-text">
            Progress: {swapStep}/5 steps completed
          </div>
        </div>
      )}

      {/* Swap Steps */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-white mb-4 munro-regular-heading">Swap Process</h3>
        <div className="space-y-4">
          {swapSteps.map((step) => {
            const status = getStepStatus(step.id);
            const isCompleted = isStepCompleted(step.id);
            
            return (
              <div 
                key={step.id}
                className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-all duration-300 ${
                  status === "completed" 
                    ? "border-green-500 bg-green-500/10" 
                    : status === "active"
                    ? "border-blue-500 bg-blue-500/10 pulse"
                    : "border-jacarta-600 bg-jacarta-700"
                }`}
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                  status === "completed" 
                    ? "bg-green-500 text-white step-complete" 
                    : status === "active"
                    ? step.color + " text-white"
                    : "bg-jacarta-600 text-jacarta-300"
                }`}>
                  {status === "completed" ? (
                    <FaCheck className="checkmark-animation" />
                  ) : status === "active" && loading ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <div className={status === "active" ? "float" : ""}>{step.icon}</div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h4 className={`font-semibold munro-narrow transition-colors duration-300 ${
                    status === "completed" ? "text-green-400" : 
                    status === "active" ? "text-blue-400" : "text-jacarta-300"
                  }`}>
                    {step.title}
                  </h4>
                  <p className="text-sm text-jacarta-400 munro-small-text">
                    {step.description}
                  </p>
                </div>

                {status === "active" && (
                  <div className="text-sm text-blue-400 munro-small-text animate-pulse">
                    Processing...
                  </div>
                )}
                {status === "completed" && (
                  <div className="text-sm text-green-400 munro-small-text">
                    ✓ Done
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mobile-stack">
        <button
          onClick={handleSwapInitiate}
          disabled={loading || !wallets?.ckBTC?.walletAddressForDisplay || swapStep > 0}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold munro-narrow hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 button-click mobile-full"
        >
          {swapStep > 0 ? "Swap in Progress..." : "Start ICP → ckBTC Swap"}
        </button>

        <button
          onClick={handleWithdrawTokens}
          disabled={loading || !wallets?.ckBTC?.walletAddressForDisplay}
          className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold munro-narrow hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 mobile-full"
        >
          Withdraw Unused Tokens
        </button>

        <button
          onClick={loadBalances}
          disabled={loadingBalances}
          className="px-6 py-3 bg-jacarta-600 text-white rounded-lg font-semibold munro-narrow hover:bg-jacarta-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 mobile-full"
        >
          {loadingBalances ? <FaSpinner className="animate-spin mx-auto" /> : "Refresh Balances"}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-800/20 border-2 border-red-500 rounded-lg shake">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-red-500 rounded-full flex-shrink-0"></div>
            <p className="text-red-300 munro-small-text">
              {typeof error === 'string' ? error : 'An error occurred during the swap process'}
            </p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {swapStep === 5 && (
        <div className="mt-6 p-4 bg-green-800/20 border-2 border-green-500 rounded-lg bounce">
          <div className="flex items-center space-x-2">
            <FaCheck className="text-green-400 checkmark-animation" />
            <p className="text-green-300 munro-small-text">
              Swap completed successfully! Your ckBTC tokens are now available in your wallet.
            </p>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="bg-jacarta-800 rounded-lg p-6 max-w-md w-full mx-4 modal-entrance">
            <h3 className="text-xl font-bold text-white mb-4 munro-regular-heading">
              Confirm Swap
            </h3>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-jacarta-300 munro-small-text">You will swap:</span>
                <span className="text-white munro-narrow">
                  {icpBalanceValue?.toFixed(6)} ICP
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-jacarta-300 munro-small-text">Estimated output:</span>
                <span className="text-green-400 munro-narrow">
                  ~ckBTC (calculated during swap)
                </span>
              </div>
              <div className="text-sm text-jacarta-400 munro-small-text">
                Note: The exact amount of ckBTC you receive will depend on current pool rates and may vary slightly from estimates.
              </div>
            </div>
            <div className="flex gap-4 mobile-stack">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2 bg-jacarta-600 text-white rounded-lg munro-narrow hover:bg-jacarta-500 mobile-full"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSwap}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg munro-narrow hover:bg-blue-600 mobile-full"
              >
                Confirm Swap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwapInterface; 