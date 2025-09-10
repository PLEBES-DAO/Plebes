// EarlyStakingProgram.tsx
//@ts-nocheck
import React, { useState, useEffect } from 'react';
import { useStaking } from '../../../hooks/StakingContext';
import './Munro.css';
import { useBioniqContext } from '../../../hooks/BioniqContext';
import Navbar from '../../headers/Navbar';
import { useTokenClient } from '../../../hooks/ICRCProvider';
import { 
  formatE8sToTokens, 
  formatE8sWithSymbol,
  EARLY_STAKING_CONSTANTS 
} from '../../../utils/tokenFormatting';
import { useNavigate } from 'react-router-dom';

export const EarlyStakingProgram = ({ login }) => {
  const { isLoggedIn, identity } = useBioniqContext();
  const navigate = useNavigate();
  const { balances } = useTokenClient();
  const {
    stakingStats,
    userStakingInfo,
    burnStats,
    isLoading,
    error,
    startStaking,
    fetchStakingData,
    fetchEarlyStakingStats
  } = useStaking();

  // Debug logging for burn stats
  useEffect(() => {
    console.log('🔥 Burn stats updated:', burnStats);
  }, [burnStats]);

  const [programStatus, setProgramStatus] = useState({
    isEligible: false,
    hasParticipated: false,
    slotsRemaining: 100,
    totalParticipants: 0,
    dailyRewards: 0,
    lifetimeBonus: false,
    joinedAt: null
  });

  // Early staking program constants (using utility constants)
  const { 
    LOCKED_AMOUNT_E8S, 
    DAILY_REWARD_E8S, 
    LIFETIME_BONUS_PERCENT, 
    MAX_PARTICIPANTS 
  } = EARLY_STAKING_CONSTANTS;

  useEffect(() => {
    if (isLoggedIn && identity) {
      console.log('🔄 Loading early staking data (auth)...');
      fetchStakingData().finally(() => {
        checkEligibility();
      });
      const interval = setInterval(() => {
        console.log('🔄 Periodic refresh of early staking data (auth)...');
        checkEligibility();
      }, 30000);
      return () => clearInterval(interval);
    } else {
      console.log('🔄 Loading early staking data (public)...');
      checkEligibility();
      const interval = setInterval(() => {
        console.log('🔄 Periodic refresh of early staking data (public)...');
        checkEligibility();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [identity, isLoggedIn]);

  useEffect(() => {
    if (userStakingInfo) {
      checkParticipationStatus();
    }
  }, [userStakingInfo]);

  const checkEligibility = async () => {
    try {
      // Use real early staking stats instead of protocol stats
      const earlyStats = await fetchEarlyStakingStats();
      console.log('📩 Early stats payload:', earlyStats);
      const slotsLeft = Number(earlyStats.slots_remaining);
      const totalParticipants = Number(earlyStats.total_participants);
      
      console.log('📊 Early staking - Participants:', totalParticipants, 'Slots left:', slotsLeft);
      
      setProgramStatus(prev => ({
        ...prev,
        isEligible: slotsLeft > 0 && (!prev.hasParticipated || !isLoggedIn),
        slotsRemaining: Math.max(0, slotsLeft),
        totalParticipants: totalParticipants
      }));
    } catch (error) {
      console.error("Error checking eligibility:", error);
    }
  };

  const checkParticipationStatus = () => {
    if (!userStakingInfo) return;

    // Check if user has already participated in early staking
    // This would be determined by checking if they have the locked tokens
    const hasStaked = userStakingInfo.staked_amount > 0n;
    const hasLifetimeBonus = false; // This would come from backend when Phase 2 starts
    
    setProgramStatus(prev => ({
      ...prev,
      hasParticipated: hasStaked,
      lifetimeBonus: hasLifetimeBonus,
      dailyRewards: hasStaked ? 1 : 0
    }));
  };

  const joinEarlyStaking = async () => {
    if (!programStatus.isEligible) return;

    try {
      // Start staking - this will give the user 10 locked PLBS
      await startStaking();
      
      // Force refresh all data after staking
      console.log('🔄 Refreshing data after staking...');
      setTimeout(() => {
        fetchStakingData();
        checkEligibility(); // Refresh early staking stats too
      }, 2000); // Wait 2 seconds for backend to process
      
      // Update program status
      setProgramStatus(prev => ({
        ...prev,
        hasParticipated: true,
        isEligible: false,
        dailyRewards: 1,
        slotsRemaining: prev.slotsRemaining - 1
      }));
    } catch (error) {
      console.error("Failed to join early staking:", error);
    }
  };

  // formatE8sToTokens is now imported from utilities

  if (!isLoggedIn) {
    return (
      <>
        <Navbar />
        <section className="relative min-h-screen mt-[20px]" style={{ marginTop: "80px" }}>
          <div className="ml-auto mr-auto max-w-[91rem] px-4 relative z-10">
            <div className="grid grid-cols-1 gap-8">
              <div className="bg-black/30 p-6 rounded-2xl">
                <div className="space-y-6">
                  <h3 className="munro-regular-text text-white text-2xl mb-4">Early Staking Program</h3>
                  <p className="text-gray-300 mb-6">Please login to participate in the Early Staking Program</p>
                  <button
                    onClick={() => { login() }}
                    className="w-full bg-morado-translucido munro-small-text text-lg py-3 rounded-lg font-semibold text-white hover:bg-opacity-80 transition-all"
                  >
                    Login
                  </button>
                </div>
              </div>
              
              {/* Public Program Status */}
              <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-6 rounded-2xl border border-purple-500/30">
                <h3 className="munro-regular-text text-white text-2xl mb-4">Live Program Status</h3>
                <div className="mt-2 flex items-center space-x-4">
                  <div className="bg-black/30 px-4 py-2 rounded-lg">
                    <span className="text-gray-300">Slots Remaining: </span>
                    <span className="text-white font-bold">{programStatus.slotsRemaining}/100</span>
                  </div>
                  <div className="bg-black/30 px-4 py-2 rounded-lg">
                    <span className="text-gray-300">Participants: </span>
                    <span className="text-white font-bold">{100 - programStatus.slotsRemaining}</span>
                  </div>
                  <div className="bg-black/30 px-4 py-2 rounded-lg">
                    <span className="text-gray-300">Progress: </span>
                    <div className="inline-block w-32 bg-gray-700 rounded-full h-2 ml-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((100 - programStatus.slotsRemaining) / 100) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Program Info */}
              <div className="bg-black/30 p-6 rounded-2xl">
                <h3 className="munro-regular-text text-white text-2xl mb-4">Program Details</h3>
                <div className="space-y-4 text-gray-300">
                  <p>🎯 <strong className="text-white">100 Testing Spots Available</strong></p>
                  <p>🔒 Each new wallet receives <strong className="text-white">10 PLBS</strong> (locked, non-transferable)</p>
                  <p>⚡ Activate by clicking "Stake" to join onchain staking</p>
                  <p>🌾 Farm <strong className="text-white">1 token per day</strong> as rewards</p>
                  <p>🏆 Early participants receive <strong className="text-white">1% lifetime farming bonus</strong> for Phase 2</p>
                  <p>📊 Total emission: 2,000 PLBS (1,000 for testing + 1,000 for farming)</p>
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
              
              {/* Program Header */}
              <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-6 rounded-2xl border border-purple-500/30">
                <h1 className="munro-regular-text text-white text-3xl mb-2">Early Staking Program</h1>
                <p className="text-gray-300 text-lg">Limited to 100 early adopters - Get lifetime farming rewards!</p>
                
                {/* Slots Counter */}
                <div className="mt-4 flex items-center space-x-4">
                  <div className="bg-black/30 px-4 py-2 rounded-lg">
                    <span className="text-gray-300">Slots Remaining: </span>
                    <span className="text-white font-bold">{programStatus.slotsRemaining}/100</span>
                  </div>
                  <div className="bg-black/30 px-4 py-2 rounded-lg">
                    <span className="text-gray-300">Progress: </span>
                    <div className="inline-block w-32 bg-gray-700 rounded-full h-2 ml-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((MAX_PARTICIPANTS - programStatus.slotsRemaining) / MAX_PARTICIPANTS) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => navigate('/staking')}
                      className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg text-white munro-small-text"
                    >
                      Join Now →
                    </button>
                  </div>
                </div>
              </div>

              {/* Participation Status */}
              {programStatus.hasParticipated ? (
                <div className="bg-green-900/30 border border-green-500/50 p-6 rounded-2xl">
                  <h3 className="munro-regular-text text-green-400 text-2xl mb-4">✅ You're In!</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-black/30 p-4 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-300">Locked Tokens:</span>
                          <span className="text-white font-bold">{formatE8sToTokens(LOCKED_AMOUNT_E8S)} PLBS</span>
                        </div>
                      </div>
                      <div className="bg-black/30 p-4 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-300">Daily Farming:</span>
                          <span className="text-green-400 font-bold">{programStatus.dailyRewards} PLBS/day</span>
                        </div>
                      </div>
                      <div className="bg-black/30 p-4 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-300">Lifetime Bonus:</span>
                          <span className="text-yellow-400 font-bold">+{LIFETIME_BONUS_PERCENT}% Forever 🏆</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-black/30 p-4 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-300">Current Staked:</span>
                          <span className="text-white">
                            {userStakingInfo ? formatE8sToTokens(userStakingInfo.staked_amount) : '0.00'} PLBS
                          </span>
                        </div>
                      </div>
                      <div className="bg-black/30 p-4 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-300">Rewards Earned:</span>
                          <span className="text-green-400">
                            {userStakingInfo ? formatE8sToTokens(userStakingInfo.reward_amount) : '0.00'} PLBS
                          </span>
                        </div>
                      </div>
                      <div className="bg-purple-900/30 p-3 rounded-lg text-center">
                        <p className="text-purple-300 text-sm">
                          🎉 You're eligible for 1% lifetime farming bonus when Phase 2 launches!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Join Program Section */
                <div className="bg-black/30 p-6 rounded-2xl">
                  <h3 className="munro-regular-text text-white text-2xl mb-4">Join Early Staking Program</h3>
                  
                  {programStatus.isEligible ? (
                    <div className="space-y-6">
                      <div className="bg-blue-900/30 border border-blue-500/50 p-4 rounded-lg">
                        <h4 className="text-blue-300 font-bold mb-2">What You'll Get:</h4>
                        <ul className="space-y-2 text-gray-300">
                          <li>🔒 10 PLBS tokens (locked, non-transferable)</li>
                          <li>🌾 1 PLBS daily farming rewards</li>
                          <li>🏆 1% lifetime farming bonus for Phase 2</li>
                          <li>🧪 Early access to test the staking system</li>
                        </ul>
                      </div>
                      
                      <button
                        onClick={joinEarlyStaking}
                        disabled={isLoading || !programStatus.isEligible}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 munro-small-text text-lg py-4 rounded-lg font-semibold text-white hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg"
                      >
                        {isLoading ? 'Joining Program...' : 'Join Early Staking Program 🚀'}
                      </button>
                      
                      <div className="bg-yellow-900/30 border border-yellow-500/50 p-4 rounded-lg">
                        <p className="text-yellow-300 text-sm">
                          ⚠️ <strong>Limited Time:</strong> Only {programStatus.slotsRemaining} spots remaining out of 100 total spots!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-900/30 border border-red-500/50 p-4 rounded-lg text-center">
                      <h4 className="text-red-400 font-bold mb-2">Program Full</h4>
                      <p className="text-gray-300">
                        Sorry, all 100 early staking spots have been filled. 
                        Stay tuned for Phase 2 launch!
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Program Statistics */}
              <div className="bg-black/30 p-6 rounded-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="munro-regular-text text-white text-2xl">Program Statistics</h3>
                  <button 
                    onClick={checkEligibility}
                    className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-sm text-white"
                    disabled={isLoading}
                  >
                    Refresh Data
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-4">Last updated: {new Date().toLocaleTimeString()}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white mb-1">
                        {MAX_PARTICIPANTS - programStatus.slotsRemaining}
                      </div>
                      <div className="text-gray-300 text-sm">Participants</div>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white mb-1">
                        {programStatus.slotsRemaining}
                      </div>
                      <div className="text-gray-300 text-sm">Spots Left</div>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white mb-1">
                        {formatE8sToTokens(BigInt((MAX_PARTICIPANTS - programStatus.slotsRemaining) * 10 * 100_000_000))}
                      </div>
                      <div className="text-gray-300 text-sm">PLBS Distributed</div>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white mb-1">
                        {LIFETIME_BONUS_PERCENT}%
                      </div>
                      <div className="text-gray-300 text-sm">Lifetime Bonus</div>
                    </div>
                  </div>
                </div>

                {/* Burn Statistics Section */}
                <div className="border-t border-gray-700 pt-6">
                  <h4 className="munro-regular-text text-white text-xl mb-4">🔥 Token Burning Activity</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-red-900/30 border border-red-500/50 p-4 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-400 mb-1">
                          {burnStats ? formatE8sToTokens(burnStats.total_burned) : '0.00'}
                        </div>
                        <div className="text-gray-300 text-sm">Tokens Burned</div>
                        <div className="text-red-300 text-xs mt-1">Removed Forever</div>
                      </div>
                    </div>
                    <div className="bg-yellow-900/30 border border-yellow-500/50 p-4 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400 mb-1">
                          {burnStats ? formatE8sToTokens(burnStats.total_to_treasury) : '0.00'}
                        </div>
                        <div className="text-gray-300 text-sm">To Treasury</div>
                        <div className="text-yellow-300 text-xs mt-1">For Development</div>
                      </div>
                    </div>
                    <div className="bg-blue-900/30 border border-blue-500/50 p-4 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400 mb-1">
                          {burnStats ? burnStats.total_burn_events.toString() : '0'}
                        </div>
                        <div className="text-gray-300 text-sm">Burn Events</div>
                        <div className="text-blue-300 text-xs mt-1">Total Transactions</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 bg-gray-800/30 p-3 rounded-lg">
                    <p className="text-gray-300 text-sm text-center">
                      💡 <strong className="text-white">Burn Mechanism:</strong> When users join early staking, 80% of bonus tokens are burned forever and 20% goes to treasury for protocol development.
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="bg-black/30 p-6 rounded-2xl">
                <h3 className="munro-regular-text text-white text-2xl mb-4">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  <div className="border-b border-gray-700 pb-4">
                    <h4 className="text-white font-bold mb-2">Why are the tokens locked?</h4>
                    <p className="text-gray-300">
                      The 10 PLBS tokens are locked to prevent system manipulation and ensure fair testing. 
                      This maintains protocol stability during the testing phase.
                    </p>
                  </div>
                  <div className="border-b border-gray-700 pb-4">
                    <h4 className="text-white font-bold mb-2">How do I claim daily rewards?</h4>
                      <p className="text-gray-300">
                      Daily rewards of 1 PLBS are automatically credited to your staking position.
                      You can withdraw them after the lockup period.
                      </p>
                  </div>
                  <div className="border-b border-gray-700 pb-4">
                    <h4 className="text-white font-bold mb-2">What's the lifetime bonus?</h4>
                    <p className="text-gray-300">
                      Early staking participants receive a permanent 1% boost to all farming rewards 
                      when Phase 2 launches. This bonus applies forever to your account.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-2">When does the program end?</h4>
                    <p className="text-gray-300">
                      The program ends when all 100 spots are filled or when we transition to Phase 2. 
                      Early participation is recommended to secure your spot and lifetime bonus.
                    </p>
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
