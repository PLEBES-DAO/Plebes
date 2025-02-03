export const idlFactory = ({ IDL }) => {
    const Account = IDL.Record({
        owner: IDL.Principal,
        subaccount: IDL.Opt(IDL.Vec(IDL.Nat8))
    });

    const Tokens = IDL.Nat;
    const Timestamp = IDL.Nat64;
    const TransferArgs = IDL.Record({
        to: Account,
        fee: IDL.Opt(Tokens),
        memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
        from_subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
        created_at_time: IDL.Opt(Timestamp),
        amount: Tokens,
    });

    const TransferError = IDL.Variant({
        GenericError: IDL.Record({ message: IDL.Text, error_code: IDL.Nat }),
        TemporarilyUnavailable: IDL.Null,
        BadBurn: IDL.Record({ min_burn_amount: Tokens }),
        Duplicate: IDL.Record({ duplicate_of: IDL.Nat }),
        BadFee: IDL.Record({ expected_fee: Tokens }),
        CreatedInFuture: IDL.Record({ ledger_time: Timestamp }),
        TooOld: IDL.Null,
        InsufficientFunds: IDL.Record({ balance: Tokens }),
    });

    const TransferResult = IDL.Variant({
        Ok: IDL.Nat,
        Err: TransferError,
    });

    return IDL.Service({
        icrc1_balance_of: IDL.Func([Account], [Tokens], ['query']),
        icrc1_name: IDL.Func([], [IDL.Text], ['query']),
        icrc1_symbol: IDL.Func([], [IDL.Text], ['query']),
        icrc1_decimals: IDL.Func([], [IDL.Nat8], ['query']),
        icrc1_total_supply: IDL.Func([], [Tokens], ['query']),
        icrc1_transfer: IDL.Func([TransferArgs], [TransferResult], []),
    });
};

export function e8sToDecimal(e8s) {
    // Validar que la entrada sea un número
    if (typeof e8s !== "number") {
        throw new Error("Input must be a number");
    }
    
    // Validar que no sea NaN o Infinity
    if (isNaN(e8s) || !isFinite(e8s)) {
        throw new Error("Input must be a valid finite number");
    }
    
    // Convertir e8s a decimal dividiendo por 10^8
    return e8s / 1e8;
}