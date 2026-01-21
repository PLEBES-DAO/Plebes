// StakingInterface.tsx
//@ts-nocheck
import React, { useState, useEffect } from 'react';
import { useStaking } from '../../../hooks/StakingContext';
import './Munro.css';
import { useBioniqContext } from '../../../hooks/BioniqContext';
import Navbar from '../../headers/Navbar';
import { useTokenClient } from '../../../hooks/ICRCProvider';
import { formatE8sToTokens, tokensToE8s } from '../../../utils/tokenFormatting';

export const StakingInterface = ({ login }) => {
  const { isLoggedIn, identity } = useBioniqContext();
  const { balances } = useTokenClient();
  const {
    stakingStats,
    userStakingInfo,
    isLoading,
    error,
    stakeTokens,
    withdrawTokens,
    startStaking,
    fetchStakingData
  } = useStaking();

  const [amount, setAmount] = useState('');
  const [activeTab, setActiveTab] = useState('stake');
  const [showStartStaking, setShowStartStaking] = useState(false);
  // Add this check before the withdraw button in the Manage Tab section

  useEffect(() => {
    console.log("balancess  in icrc", balances)
    if (balances) {
      setAmount(balances["PLBS"].toString())
    }
  }, [balances])

  useEffect(() => {
    fetchStakingData();
  }, []);

  useEffect(() => {
    console.log("userStaking", userStakingInfo)
    if (userStakingInfo && userStakingInfo.staked_amount) {
      console.log("in user takin not in else", userStakingInfo)
      setShowStartStaking(false);
      setActiveTab("manage")
    } else {
      console.log("chaning tabn to stake")
      setActiveTab('stake')
      setShowStartStaking(true);
    }
  }, [userStakingInfo, isLoading, identity]);

  const handleStake = async () => {
    if (!amount) return;
    try {
      const amountE8s = tokensToE8s(amount);
      await stakeTokens(amountE8s);
      setAmount('');
    } catch (error) {
      console.error("Staking failed:", error);
    }
  };

  const handleWithdraw = async () => {
    try {
      await withdrawTokens();
    } catch (error) {
      console.error("Withdrawal failed:", error);
    }
  };


  const handleStartStaking = async () => {
    try {
      await startStaking();
      setShowStartStaking(false);
    } catch (error) {
      console.error("Start staking failed:", error);
    }
  };

  const formatBalance = (balance: bigint | null) => {
    if (balance === null || balance === 0n) return '0.00';
    return formatE8sToTokens(balance);
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) / 1000000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isLoggedIn) {
    return (
      <>
        <Navbar />
        <section className="relative min-h-screen mt-[20px]" style={{ marginTop: "80px" }}>
          <div className="ml-auto mr-auto max-w-[91rem] px-4 relative z-10">
            <div className="grid grid-cols-1 gap-8">
              <div className="bg-black/30 p-6 rounded-2xl">
                <div className="space-y-6">
                  <h3 className="munro-regular-text text-white text-2xl mb-4">Please Login</h3>
                  <p className="text-gray-300 mb-6">You need to be logged in to access the staking interface.</p>
                  <button
                    onClick={() => { login() }} // Adjust this to your login route
                    className="w-full bg-morado-translucido munro-small-text text-lg py-3 rounded-lg font-semibold text-white hover:bg-opacity-80 transition-all"
                  >
                    Login
                  </button>
                </div>
              </div>
            </div>
            {/* Protocol Stats */}
            <div className="bg-black/30 p-6 rounded-2xl p-16">
              <h3 className="munro-regular-text text-white text-2xl mb-4">Protocol Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">Total Staked:</span>
                    <span className="text-white">
                      {stakingStats ? stakingStats.total_staked.toString() : '0.00'}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">Total Locked:</span>
                    <span className="text-white">
                      {stakingStats ? stakingStats.total_locked.toString() : '0.00'}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">Total Stakers:</span>
                    <span className="text-white">
                      {stakingStats ? stakingStats.total_stakers.toString() : '0'}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">Rewards Distributed:</span>
                    <span className="text-white">
                      {stakingStats ? stakingStats.total_rewards_distributed.toString() : '0.00'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>


        </section>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main>
        <section className="relative min-h-screen mt-[20px]" style={{ marginTop: "50px" }}>
          <div className="ml-auto mr-auto max-w-[91rem] px-4 relative z-10 p-8">
            <div className="grid grid-cols-1 gap-8">
              
              {/* Early Staking Program Banner */}
              <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-4 rounded-2xl border border-purple-500/30">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="munro-regular-text text-white text-lg mb-1">🚀 Early Staking Program</h3>
                    <p className="text-gray-300 text-sm">
                      Join 100 early adopters • Get 10 PLBS locked + daily rewards • Lifetime 1% farming bonus
                    </p>
                  </div>
                  <a 
                    href="/early-staking"
                    className="bg-purple-600 hover:bg-purple-500 munro-small-text text-white px-6 py-2 rounded-lg transition-all shadow-lg flex-shrink-0"
                  >
                    Join Now →
                  </a>
                </div>
              </div>
              {/* Staking Tabs */}
              <div className="bg-black/30 p-6 rounded-2xl">
                {showStartStaking ? (
                  <div className="space-y-6">
                    <h3 className="munro-regular-text text-white text-2xl mb-4">Start Staking</h3>
                    <p className="text-gray-300 mb-6">You need to initialize your staking account first</p>
                    <button
                      onClick={handleStartStaking}
                      disabled={isLoading}
                      className="w-full bg-morado-translucido munro-small-text text-lg py-3 rounded-lg font-semibold text-white hover:bg-opacity-80 transition-all"
                    >
                      {isLoading ? 'Processing...' : 'Start Staking'}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex mb-6 border-b border-gray-700">
                      <button
                        className={`munro-small-text px-4 py-2 ${activeTab === 'stake' ? 'text-white border-b-2 border-purple-500' : 'text-gray-400'}`}
                        onClick={() => setActiveTab('stake')}
                      >
                        Stake
                      </button>
                      {userStakingInfo && (
                        <button
                          className={`munro-small-text px-4 py-2 ${activeTab === 'manage' ? 'text-white border-b-2 border-purple-500' : 'text-gray-400'}`}
                          onClick={() => setActiveTab('manage')}
                        >
                          Manage
                        </button>
                      )}
                    </div>


                    {activeTab === 'stake' && (
                      <div className="space-y-6">
                        <h3 className="munro-regular-text text-white text-2xl mb-4">Stake Tokens</h3>
                        <h6 className="munro-regular-text text-white text-2xl mb-4">PLBS Balance {balances && balances["PLBS"]}</h6>
                        <div className="mb-4">
                          <label className="block text-gray-300 mb-2">Amount to Stake</label>
                          <div className="flex">
                            <input
                              type="number"
                              value={amount.toString()}
                              onChange={(e) => setAmount(e.target.value)}
                              placeholder="0.00"
                              className="w-1/2 bg-gray-800 text-gray-300 p-3 rounded-l-lg"
                              disabled={isLoading}
                            />
                            <span className="bg-gray-700 text-white p-3 rounded-r-lg">Tokens</span>
                          </div>
                          {/* Add percentage buttons here */}
                          <div className="flex justify-between mt-2 space-x-2">
                            <button
                              onClick={() => setAmount((Number(balances["PLBS"]) * 0.1).toString())}
                              className="bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-all"
                            >
                              10%
                            </button>
                            <button
                              onClick={() => setAmount((Number(balances["PLBS"]) * 0.25).toString())}
                              className="bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-all"
                            >
                              25%
                            </button>
                            <button
                              onClick={() => setAmount((Number(balances["PLBS"]) * 0.5).toString())}
                              className="bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-all"
                            >
                              50%
                            </button>
                            <button
                              onClick={() => setAmount((Number(balances["PLBS"]) * 0.99).toString())}
                              className="bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-all"
                            >
                              99%
                            </button>
                            <button
                              onClick={() => setAmount(balances["PLBS"].toString())}
                              className="bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-all"
                            >
                              MAX
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={handleStake}
                          disabled={isLoading || !amount}
                          className="w-full bg-morado-translucido munro-small-text text-lg py-3 rounded-lg font-semibold text-white hover:bg-opacity-80 transition-all"
                        >
                          {isLoading ? 'Processing...' : 'Stake Tokens'}
                        </button>
                      </div>
                    )}

                    {/* Manage Tab */}
                    {activeTab === 'manage' && userStakingInfo && userStakingInfo.staked_amount && (
                      <div className="space-y-6">
                        <h3 className="munro-regular-text text-white text-2xl mb-4">Your Staking Position</h3>

                        <div className="bg-gray-800/50 p-4 rounded-lg">
                          <div className="flex justify-between mb-3">
                            <span className="text-gray-300">Staked Amount:</span>
                            <span className="text-white">{formatE8sToTokens(userStakingInfo.staked_amount)} PLBS</span>
                          </div>
                          <div className="flex justify-between mb-3">
                            <span className="text-gray-300">Rewards Earned:</span>
                            <span className="text-green-400">{formatE8sToTokens(userStakingInfo.reward_amount)} PLBS</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Unlock Time:</span>
                            <span className="text-white">
                              {formatDate(userStakingInfo.unlock_time)}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <button
                            onClick={handleWithdraw}
                            disabled={isLoading}
                            className="bg-morado-translucido munro-small-text text-lg py-3 rounded-lg font-semibold text-white hover:bg-opacity-80 transition-all"
                          >
                            {isLoading ? 'Processing...' : 'Withdraw'}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Protocol Stats */}
              <div className="bg-black/30 p-6 rounded-2xl">
                <h3 className="munro-regular-text text-white text-2xl mb-4">Protocol Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300">Total Staked:</span>
                    <span className="text-white">
                        {stakingStats ? formatE8sToTokens(stakingStats.total_staked) + ' PLBS' : '0.00 PLBS'}
                    </span>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300">Total Locked:</span>
                    <span className="text-white">
                        {stakingStats ? formatE8sToTokens(stakingStats.total_locked) + ' PLBS' : '0.00 PLBS'}
                    </span>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300">Total Stakers:</span>
                      <span className="text-white">
                        {stakingStats ? stakingStats.total_stakers.toString() : '0'}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300">Rewards Distributed:</span>
                    <span className="text-white">
                        {stakingStats ? formatE8sToTokens(stakingStats.total_rewards_distributed) + ' PLBS' : '0.00 PLBS'}
                    </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};