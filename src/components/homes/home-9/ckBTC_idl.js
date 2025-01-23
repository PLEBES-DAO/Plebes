export const idlFactory = ({ IDL }) => {
    const Account = IDL.Record({
        owner: IDL.Principal,
        subaccount: IDL.Opt(IDL.Vec(IDL.Nat8))
    });

    const Tokens = IDL.Nat;

    return IDL.Service({
        icrc1_balance_of: IDL.Func([Account], [Tokens], ['query']),
        icrc1_name: IDL.Func([], [IDL.Text], ['query']),
        icrc1_symbol: IDL.Func([], [IDL.Text], ['query']),
        icrc1_decimals: IDL.Func([], [IDL.Nat8], ['query']),
        icrc1_total_supply: IDL.Func([], [Tokens], ['query'])
    });
};