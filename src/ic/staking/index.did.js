export const idlFactory = ({ IDL }) => {
    const TransferError = IDL.Variant({
      'GenericError' : IDL.Record({
        'message' : IDL.Text,
        'error_code' : IDL.Nat,
      }),
      'TemporarilyUnavailable' : IDL.Null,
      'BadBurn' : IDL.Record({ 'min_burn_amount' : IDL.Nat }),
      'Duplicate' : IDL.Record({ 'duplicate_of' : IDL.Nat }),
      'BadFee' : IDL.Record({ 'expected_fee' : IDL.Nat }),
      'CreatedInFuture' : IDL.Record({ 'ledger_time' : IDL.Nat64 }),
      'TooOld' : IDL.Null,
      'InsufficientFunds' : IDL.Record({ 'balance' : IDL.Nat }),
    });
    const TransferFromError = IDL.Variant({
      'GenericError' : IDL.Record({
        'message' : IDL.Text,
        'error_code' : IDL.Nat,
      }),
      'TemporarilyUnavailable' : IDL.Null,
      'InsufficientAllowance' : IDL.Record({ 'allowance' : IDL.Nat }),
      'BadBurn' : IDL.Record({ 'min_burn_amount' : IDL.Nat }),
      'Duplicate' : IDL.Record({ 'duplicate_of' : IDL.Nat }),
      'BadFee' : IDL.Record({ 'expected_fee' : IDL.Nat }),
      'CreatedInFuture' : IDL.Record({ 'ledger_time' : IDL.Nat64 }),
      'TooOld' : IDL.Null,
      'InsufficientFunds' : IDL.Record({ 'balance' : IDL.Nat }),
    });
    const StakingError = IDL.Variant({
      'InvalidAmount' : IDL.Null,
      'TransferError' : TransferError,
      'AlreadyStaking' : IDL.Null,
      'InsufficientBalance' : IDL.Null,
      'CanisterCallFailed' : IDL.Tuple(IDL.Nat32, IDL.Text),
      'LockupPeriodNotEnded' : IDL.Null,
      'TransferFailed' : TransferFromError,
      'InternalError' : IDL.Text,
      'NotStaking' : IDL.Null,
    });
    const Result = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : StakingError });
    const ProtocolStats = IDL.Record({
      'total_staked' : IDL.Nat,
      'total_locked' : IDL.Nat,
      'total_stakers' : IDL.Nat64,
      'total_rewards_distributed' : IDL.Nat,
    });
    const StakingInfo = IDL.Record({
      'staked_amount' : IDL.Nat,
      'unlock_time' : IDL.Nat64,
      'last_claim_time' : IDL.Nat64,
      'reward_amount' : IDL.Nat,
      'start_time' : IDL.Nat64,
    });
    const Result_1 = IDL.Variant({ 'Ok' : StakingInfo, 'Err' : StakingError });
    const Result_2 = IDL.Variant({ 'Ok' : IDL.Nat, 'Err' : StakingError });
    return IDL.Service({
      'compound_rewards' : IDL.Func([], [Result], []),
      'get_protocol_stats' : IDL.Func([], [ProtocolStats], ['query']),
      'get_token_canister' : IDL.Func([], [IDL.Principal], ['query']),
      'my_staking_balance' : IDL.Func([], [Result_1], ['query']),
      'set_token_canister' : IDL.Func([IDL.Principal], [], []),
      'stake' : IDL.Func([IDL.Nat], [Result_2], []),
      'staking_balance' : IDL.Func([IDL.Principal], [Result_1], ['query']),
      'start_staking' : IDL.Func([], [Result_2], []),
      'subaccount_balance' : IDL.Func([IDL.Principal], [Result_2], ['query']),
      'withdraw' : IDL.Func([], [Result_2], []),
    });
  };
  export const init = ({ IDL }) => { return []; };