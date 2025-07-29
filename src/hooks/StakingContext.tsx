// StakingContext.tsx
//@ts-nocheck
import { Principal } from "@dfinity/principal";
import React, { createContext, useContext, useEffect, useState } from "react";
import { createStakingActor } from "../ic/staking/index.js";
import { createicrc1Actor } from "../ic/icpswap/icrc1/index.js";
import { useBioniqContext } from "./BioniqContext.jsx";

const StakingContext = createContext(null);

export const useStakingClient = () => {
  const { identity,setError,error} = useBioniqContext();
  const [stakingStats, setStakingStats] = useState<ProtocolStats | null>(null);
  const [userStakingInfo, setUserStakingInfo] = useState<StakingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorIn, setErrorIn] = useState<StakingError | null>(null);

  // Canister IDs
  const stakingCanisterId = "qyxbw-vyaaa-aaaag-auepq-cai";
  const tokenCanisterId = "olpbc-wyaaa-aaaag-acnya-cai";

  // Actor creators
  const createStakingActorAsync = () => {
    return createStakingActor(stakingCanisterId, {
      agentOptions: { identity }
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
        if(result && result.Err && result.Err.NotStaking){
          return
        }
        setError("error fetching user dataa");
        
      }
    } catch (error) {
      setUserStakingInfo(null);
      console.error("Failed to fetch staking info:", error);
      throw error;
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
      await Promise.all([
        fetchProtocolStats(),
        fetchUserStakingInfo()
      ]);
    } catch (error) {
      console.error("Failed to fetch staking data:", error);
      setError(error);
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
    console.log("identity in stakig",identity)
    const loadData = async () => {
      await fetchStakingData();
    };

    loadData();
  }, [identity]);

  return {
    // State
    stakingStats,
    userStakingInfo,
    isLoading,
    error,
    
    // Functions
    fetchStakingData,
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