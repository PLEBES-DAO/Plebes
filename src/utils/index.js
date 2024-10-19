
export function toDefaultSub(owner, subaccount = []) {
    return { owner: owner, subaccount: subaccount };
  }
  
  export function defaultDepositIcpSwap(token, amount, fee = 3000) {
    return { token: token, amount: amount, fee: fee };
  }
  
  export function ApproveICP(spender, fee, amount) {
    return {
      fee: [],
      memo: [],
      from_subaccount: [],
      created_at_time: [],
      amount: amount,
      expected_allowance: [],
      expires_at: [],
      spender: { owner: spender, subaccount: [] },
    };
  }
  
  export function defaultIcrcTransferArgs(
    to,
    transferBalance,
    fee = [],
    subaccount = [],
    from_subaccount = []
  ) {
    return {
      fee: fee,
      amount: transferBalance,
      memo: [],
      from_subaccount: from_subaccount,
      to: toDefaultSub(to, subaccount),
      created_at_time: [],
    };
  }
  
  export function formatIcrcBalance(balance, supply) {
    let supplyAMillionth = Number(supply) / 100000000;
    return (Number(balance) * supplyAMillionth) / Number(supply);
  }
  
  export function reverseFormatIcrcBalance(scaledBalance, supply) {
    let supplyAMillionth = Number(supply) / 100000000;
    let floatNumber = (Number(scaledBalance) * Number(supply)) / supplyAMillionth;
    let truncatedInt = Math.trunc(floatNumber);
    return truncatedInt;
  }



  export function formatNumberWithPattern(number) {
    // Convert the number to a string to get its length
    const numStr = number.toString();
    const numDigits = numStr.length;
  
    // Determine how many zeros to add based on the number of digits
    // If there are n digits, we should add (8 - n) zeros
    const zeroCount = 8 - numDigits;
  
    // Create the '0.' followed by the calculated number of zeros and the original number
    const formattedNumber = `0.${'0'.repeat(zeroCount)}${numStr}`;
  
    return formattedNumber;
  }