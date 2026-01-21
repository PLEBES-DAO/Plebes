import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface ProtocolStats {
  'total_staked' : bigint,
  'total_locked' : bigint,
  'total_stakers' : bigint,
  'total_rewards_distributed' : bigint,
}
export type Result = { 'Ok' : null } |
  { 'Err' : StakingError };
export type Result_1 = { 'Ok' : StakingInfo } |
  { 'Err' : StakingError };
export type Result_2 = { 'Ok' : bigint } |
  { 'Err' : StakingError };
export type StakingError = { 'InvalidAmount' : null } |
  { 'TransferError' : TransferError } |
  { 'AlreadyStaking' : null } |
  { 'InsufficientBalance' : null } |
  { 'CanisterCallFailed' : [number, string] } |
  { 'LockupPeriodNotEnded' : null } |
  { 'TransferFailed' : TransferFromError } |
  { 'InternalError' : string } |
  { 'NotStaking' : null };
export interface StakingInfo {
  'staked_amount' : bigint,
  'unlock_time' : bigint,
  'last_claim_time' : bigint,
  'reward_amount' : bigint,
  'start_time' : bigint,
}
export type TransferError = {
    'GenericError' : { 'message' : string, 'error_code' : bigint }
  } |
  { 'TemporarilyUnavailable' : null } |
  { 'BadBurn' : { 'min_burn_amount' : bigint } } |
  { 'Duplicate' : { 'duplicate_of' : bigint } } |
  { 'BadFee' : { 'expected_fee' : bigint } } |
  { 'CreatedInFuture' : { 'ledger_time' : bigint } } |
  { 'TooOld' : null } |
  { 'InsufficientFunds' : { 'balance' : bigint } };
export type TransferFromError = {
    'GenericError' : { 'message' : string, 'error_code' : bigint }
  } |
  { 'TemporarilyUnavailable' : null } |
  { 'InsufficientAllowance' : { 'allowance' : bigint } } |
  { 'BadBurn' : { 'min_burn_amount' : bigint } } |
  { 'Duplicate' : { 'duplicate_of' : bigint } } |
  { 'BadFee' : { 'expected_fee' : bigint } } |
  { 'CreatedInFuture' : { 'ledger_time' : bigint } } |
  { 'TooOld' : null } |
  { 'InsufficientFunds' : { 'balance' : bigint } };
export interface BurnStats {
  'total_burned': bigint,
  'total_to_treasury': bigint,
  'total_burn_events': bigint,
}
export interface EarlyStakingInfo {
  'is_eligible': boolean,
  'is_participant': boolean,
  'slots_remaining': bigint,
  'total_participants': bigint,
  'joined_at': [] | [bigint],
  'lifetime_bonus_eligible': boolean,
}
export interface EarlyStakingStats {
  'total_participants': bigint,
  'slots_remaining': bigint,
}
export interface _SERVICE {
  'compound_rewards' : ActorMethod<[], Result>,
  'get_burn_stats': ActorMethod<[], BurnStats>,
  'get_early_staking_info': ActorMethod<[Principal], EarlyStakingInfo>,
'get_early_staking_stats': ActorMethod<[], bigint>,
  'get_protocol_stats' : ActorMethod<[], ProtocolStats>,
  'get_token_canister' : ActorMethod<[], Principal>,
  'join_early_staking_program': ActorMethod<[], { 'Ok': string } | { 'Err': string }>,
  'my_early_staking_info': ActorMethod<[], EarlyStakingInfo>,
  'my_staking_balance' : ActorMethod<[], Result_1>,
  'set_token_canister' : ActorMethod<[Principal], undefined>,
  'stake' : ActorMethod<[bigint], Result_2>,
  'staking_balance' : ActorMethod<[Principal], Result_1>,
  'start_staking' : ActorMethod<[], Result_2>,
  'subaccount_balance' : ActorMethod<[Principal], Result_2>,
  'user_subaccountQ' : ActorMethod<[Principal], Uint8Array | number[]>,
  'withdraw' : ActorMethod<[], Result_2>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
