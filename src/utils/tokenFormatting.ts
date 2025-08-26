// Token formatting utilities for e8s (100,000,000 = 1 token)
//@ts-nocheck

export const E8S_PER_TOKEN = 100_000_000;

/**
 * Converts e8s amount to human-readable token amount
 * @param e8sAmount - Amount in e8s (smallest unit)
 * @returns Formatted token amount string
 */
export const formatE8sToTokens = (e8sAmount: bigint | number | string): string => {
  const amount = typeof e8sAmount === 'bigint' 
    ? Number(e8sAmount) 
    : typeof e8sAmount === 'string' 
      ? Number(e8sAmount) 
      : e8sAmount;
      
  if (amount === 0 || isNaN(amount)) return '0.00';
  
  const tokens = amount / E8S_PER_TOKEN;
  return tokens.toFixed(2);
};

/**
 * Converts token amount to e8s
 * @param tokenAmount - Amount in tokens (human-readable)
 * @returns Amount in e8s as BigInt
 */
export const tokensToE8s = (tokenAmount: number | string): bigint => {
  const amount = typeof tokenAmount === 'string' ? Number(tokenAmount) : tokenAmount;
  if (isNaN(amount)) return BigInt(0);
  
  return BigInt(Math.floor(amount * E8S_PER_TOKEN));
};

/**
 * Formats e8s amount with proper token symbol
 * @param e8sAmount - Amount in e8s
 * @param symbol - Token symbol (default: PLBS)
 * @returns Formatted string with symbol
 */
export const formatE8sWithSymbol = (
  e8sAmount: bigint | number | string, 
  symbol: string = 'PLBS'
): string => {
  return `${formatE8sToTokens(e8sAmount)} ${symbol}`;
};

/**
 * Formats large numbers with appropriate units (K, M, B)
 * @param amount - Number to format
 * @returns Formatted string with units
 */
export const formatLargeNumber = (amount: number): string => {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)}B`;
  } else if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M`;
  } else if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(1)}K`;
  }
  return amount.toFixed(0);
};

/**
 * Formats e8s amount with large number formatting
 * @param e8sAmount - Amount in e8s
 * @param symbol - Token symbol
 * @returns Formatted string with units and symbol
 */
export const formatE8sCompact = (
  e8sAmount: bigint | number | string,
  symbol: string = 'PLBS'
): string => {
  const tokens = Number(formatE8sToTokens(e8sAmount));
  return `${formatLargeNumber(tokens)} ${symbol}`;
};

/**
 * Parses token input and validates it
 * @param input - User input string
 * @returns Valid number or null if invalid
 */
export const parseTokenInput = (input: string): number | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;
  
  const number = Number(trimmed);
  if (isNaN(number) || number < 0) return null;
  
  return number;
};

/**
 * Validates if amount meets minimum requirements
 * @param e8sAmount - Amount in e8s
 * @param minTokens - Minimum tokens required (default: 10)
 * @returns true if valid, false otherwise
 */
export const validateMinimumAmount = (
  e8sAmount: bigint | number | string,
  minTokens: number = 10
): boolean => {
  const tokens = Number(formatE8sToTokens(e8sAmount));
  return tokens >= minTokens;
};

/**
 * Early Staking Program constants
 */
export const EARLY_STAKING_CONSTANTS = {
  LOCKED_AMOUNT_E8S: BigInt(10 * E8S_PER_TOKEN), // 10 PLBS in e8s
  DAILY_REWARD_E8S: BigInt(1 * E8S_PER_TOKEN),  // 1 PLBS per day in e8s
  LIFETIME_BONUS_PERCENT: 1, // 1% lifetime farming bonus
  MAX_PARTICIPANTS: 100,
  MIN_STAKE_AMOUNT_E8S: BigInt(10 * E8S_PER_TOKEN), // 10 PLBS minimum
} as const;
