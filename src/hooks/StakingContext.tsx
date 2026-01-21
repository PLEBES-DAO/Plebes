// StakingContext.tsx
//@ts-nocheck
import { Principal } from "@dfinity/principal";
import React, { createContext, useContext, useEffect, useState } from "react";
import { createActor } from "../declarations/backend/index.js";
import { createicrc1Actor } from "../ic/icpswap/icrc1/index.js";
import { useBioniqContext } from "./BioniqContext.jsx";
import { EARLY_STAKING_CONSTANTS } from "../utils/tokenFormatting";

const StakingContext = createContext(null);

export const useStakingClient = () => {
  const { identity,setError,error} = useBioniqContext();
  const [stakingStats, setStakingStats] = useState<ProtocolStats | null>(null);
  const [userStakingInfo, setUserStakingInfo] = useState<StakingInfo | null>(null);
  const [burnStats, setBurnStats] = useState<BurnStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorIn, setErrorIn] = useState<StakingError | null>(null);

  // Canister IDs
  const stakingCanisterId = "qyxbw-vyaaa-aaaag-auepq-cai";
  const tokenCanisterId = "olpbc-wyaaa-aaaag-acnya-cai";

  // Actor creators
  const createStakingActorAsync = () => {
    const agentOptions = identity ? { identity, host: 'https://icp-api.io' } : { host: 'https://icp-api.io' };
    return createActor(stakingCanisterId, {
      agentOptions,
      actorOptions: {},
    });
  };

  const createTokenActor = () => {
    return createicrc1Actor(tokenCanisterId, {
      agentOptions: { identity }
    });
  };

  // Protocol stats
  const fetchProtocolStats = async (): Promise<ProtocolStats> => {
    try {
      const actor = createStakingActorAsync();
      const stats = await actor.get_protocol_stats();
      setStakingStats(stats);
      return stats;
    } catch (error) {
      console.error("Failed to fetch protocol stats:", error);
      throw error;
    }
  };

  // Burn stats
  const fetchBurnStats = async (): Promise<BurnStats> => {
    try {
      const actor = createStakingActorAsync();
      const stats = await actor.get_burn_stats();
      console.log('Burn stats from backend:', stats);
      setBurnStats(stats);
      return stats;
    } catch (error) {
      console.error("Failed to fetch burn stats:", error);
      // Don't throw - burn stats are optional - set fallback data
      const fallbackStats = {
        total_burned: BigInt(0),
        total_to_treasury: BigInt(0),
        total_burn_events: BigInt(0)
      };
      setBurnStats(fallbackStats);
      return fallbackStats;
    }
  };

  // Early staking stats
  const fetchEarlyStakingStats = async (): Promise<{ total_participants: bigint, slots_remaining: bigint }> => {
    const max = BigInt(EARLY_STAKING_CONSTANTS?.MAX_PARTICIPANTS ?? 100);
    try {
      const actor = createStakingActorAsync();
      const slotsRemaining = await actor.get_early_staking_stats();
      console.log('Early staking stats (slots remaining) from backend:', slotsRemaining);

      const slots = BigInt(slotsRemaining ?? 100);
      return {
        total_participants: max - slots,
        slots_remaining: slots,
      };
    } catch (error) {
      console.warn("get_early_staking_stats failed, falling back to get_protocol_stats:", error);
      try {
        const actor = createStakingActorAsync();
        const stats = await actor.get_protocol_stats();
        const participants = BigInt(stats?.total_stakers ?? 0);
        const slots = max > participants ? max - participants : BigInt(0);
        console.log('Fallback via protocol stats:', { participants: participants.toString(), slots: slots.toString() });
        return {
          total_participants: participants,
          slots_remaining: slots,
        };
      } catch (err2) {
        console.error("Fallback fetch via get_protocol_stats failed:", err2);
        return {
          total_participants: BigInt(0),
          slots_remaining: max,
        };
      }
    }
  };

  // User staking info
  const fetchUserStakingInfo = async (): Promise<StakingInfo> => { 
    try {
      const actor = createStakingActorAsync();
      const result = await actor.my_staking_balance();
      console.log("result",result)
      if ('Ok' in result) {
        setUserStakingInfo(result.Ok);
        return result.Ok;
      } else {
        setUserStakingInfo(null);
        // Don't show error for NotStaking - it's normal for new users
        if(result && result.Err && result.Err.NotStaking){
          console.log("User is not staking yet - this is expected for new users");
          return null;
        }
        // Don't show modal errors for normal states - just log them
        console.warn("User staking data not available:", result.Err);
        return null;
      }
    } catch (error) {
      setUserStakingInfo(null);
      console.error("Failed to fetch staking info:", error);
      // Don't throw - this prevents the modal from showing
      return null;
    }
  };

  // Start staking
  const startStaking = async (): Promise<bigint> => {
    setIsLoading(true);
    try {
      const actor = createStakingActorAsync();
      const result = await actor.start_staking();
      if ('Ok' in result) {
        await fetchStakingData();
        return result.Ok;
      } else {
        setError("error while staking");
        
      }
    } catch (error) {
      console.error("Start staking failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all staking data
  const fetchStakingData = async () => {    
    setIsLoading(true);
    try {
      // Fetch protocol stats first (this should always work)
      await fetchProtocolStats();
      // Fetch burn stats (optional)
      await fetchBurnStats();
      // Fetch user info but don't fail if user isn't staking
      await fetchUserStakingInfo();
    } catch (error) {
      console.error("Failed to fetch staking data:", error);
      // Only show error modal for protocol stats failures, not user data failures
      if (!stakingStats) {
        setError("Unable to connect to staking service");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Token approval and staking
  const stakeTokens = async (amount: bigint): Promise<bigint> => {
    setIsLoading(true);
    try {
      const tokenActor = createTokenActor();
      const stakingActor = createStakingActorAsync();

      // Approve staking canister to spend tokens
      const approveResult = await tokenActor.icrc2_approve({
        amount,
        spender: { owner: Principal.fromText(stakingCanisterId) },
        fee: [],
        memo: [],
        from_subaccount: [],
        created_at_time: [],
        expected_allowance: [],
        expires_at: []
      });

      if ('Err' in approveResult) {
        throw new Error(`Approval failed: ${JSON.stringify(approveResult.Err)}`);
      }

      // Execute stake
      const stakeResult = await stakingActor.stake(amount);
      
      if ('Ok' in stakeResult) {
        await fetchStakingData();
        return stakeResult.Ok;
      } else {
        setError("error while staking");
        throw stakeResult.Err;
      }
    } catch (error) {
      console.error("Staking failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Withdraw tokens
  const withdrawTokens = async (): Promise<bigint> => {
    setIsLoading(true);
    try {
      const actor = createStakingActorAsync();
      const result = await actor.withdraw();
      
      if ('Ok' in result) {
        await fetchStakingData();
        return result.Ok;
      } else {
        setError("error while withdrawing");
        
      }
    } catch (error) {
      console.error("Withdrawal failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Compound rewards
  const compoundRewards = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const actor = createStakingActorAsync();
      const result = await actor.compound_rewards();
      console.log("result",result)
      if ('Ok' in result) {
        await fetchStakingData();
      } else {
        setError("come back tomorrow no rewards for now");
        
      }
    } catch (error) {
      console.error("Compounding failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize data on mount and when identity changes
  useEffect(() => {
    console.log("identity in staking", identity);
    
    // Only fetch data if user is logged in
    if (identity) {
      const loadData = async () => {
        await fetchStakingData();
      };
      loadData();
    } else {
      // Clear state when user is not logged in
      setStakingStats(null);
      setUserStakingInfo(null);
      setBurnStats(null);
      setIsLoading(false);
      setErrorIn(null);
    }
  }, [identity]);

  return {
    // State
    stakingStats,
    userStakingInfo,
    burnStats,
    isLoading,
    error,
    
    // Functions
    fetchStakingData,
    fetchBurnStats,
    fetchEarlyStakingStats,
    startStaking,
    stakeTokens,
    withdrawTokens,
    compoundRewards,
    setTokenCanister: async (canisterId: string) => {
      setIsLoading(true);
      try {
        const actor = createStakingActorAsync();
        await actor.set_token_canister(Principal.fromText(canisterId));
      } finally {
        setIsLoading(false);
      }
    },
    getTokenCanister: async () => {
      setIsLoading(true);
      try {
        const actor = createStakingActorAsync();
        return await actor.get_token_canister();
      } finally {
        setIsLoading(false);
      }
    }
  };
};

export const StakingProvider = ({ children }) => {
  const staking = useStakingClient();
  return (
    <StakingContext.Provider value={staking}>
      {children}
    </StakingContext.Provider>
  );
};

export const useStaking = () => useContext(StakingContext);

// Types based on IDL
interface ProtocolStats {
  total_staked: bigint;
  total_locked: bigint;
  total_stakers: bigint;
  total_rewards_distributed: bigint;
}

interface StakingInfo {
  staked_amount: bigint;
  unlock_time: bigint;
  last_claim_time: bigint;
  reward_amount: bigint;
  start_time: bigint;
}

type StakingError = {
  InvalidAmount?: null;
  TransferError?: TransferError;
  AlreadyStaking?: null;
  InsufficientBalance?: null;
  CanisterCallFailed?: [number, string];
  LockupPeriodNotEnded?: null;
  TransferFailed?: TransferFromError;
  InternalError?: string;
  NotStaking?: null;
};

type TransferError = {
  GenericError?: { message: string; error_code: bigint };
  TemporarilyUnavailable?: null;
  BadBurn?: { min_burn_amount: bigint };
  Duplicate?: { duplicate_of: bigint };
  BadFee?: { expected_fee: bigint };
  CreatedInFuture?: { ledger_time: bigint };
  TooOld?: null;
  InsufficientFunds?: { balance: bigint };
};

type TransferFromError = {
  GenericError?: { message: string; error_code: bigint };
  TemporarilyUnavailable?: null;
  InsufficientAllowance?: { allowance: bigint };
  BadBurn?: { min_burn_amount: bigint };
  Duplicate?: { duplicate_of: bigint };
  BadFee?: { expected_fee: bigint };
  CreatedInFuture?: { ledger_time: bigint };
  TooOld?: null;
  InsufficientFunds?: { balance: bigint };
};

interface BurnStats {
  total_burned: bigint;
  total_to_treasury: bigint;
  total_burn_events: bigint;
}
