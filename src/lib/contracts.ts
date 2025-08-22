// BaseStay Smart Contract Addresses on Base Mainnet
// Deployed and verified contracts

export const CONTRACT_ADDRESSES = {
  // BST Token Contract (Deployed on Base Mainnet)
  BST_TOKEN: '0x8fDc3a7c612bc637B5659526B29Ee233e291F371' as `0x${string}`,
  
  // Core Platform Contracts (Deployed on Base Mainnet)
  PROPERTY_REGISTRY: '0x1CBE968d60aeaabfe3E11C2c3C3fBAe74193d708' as `0x${string}`,
  BOOKING_MANAGER: '0x07314d16678595162fC55e02Df28e36839a81b74' as `0x${string}`,
  REVIEW_SYSTEM: '0x529B251FE5B4d38a9F31199F201F57b0002bA965' as `0x${string}`,
  
  // Staking & Rewards
  STAKING_REWARDS: '0x5678901234567890123456789012345678901234' as `0x${string}`,
} as const

// Network Configuration
export const NETWORK_CONFIG = {
  chainId: 8453, // Base Mainnet
  name: 'Base',
  rpcUrl: 'https://mainnet.base.org',
  blockExplorer: 'https://basescan.org'
} as const

// BST Token Configuration
export const BST_CONFIG = {
  symbol: 'BST',
  name: 'BaseStay Token',
  decimals: 18,
  totalSupply: '10000000000', // 10 billion BST
  minHostStake: '1000', // 1000 BST minimum for hosts
  rewardRate: 100, // 1% APY (100 basis points)
  hostRewardMultiplier: 150, // 1.5x rewards for hosts
} as const

// Platform Configuration
export const PLATFORM_CONFIG = {
  platformFee: 250, // 2.5% platform fee (250 basis points)
  hostDeposit: 500, // 5% host deposit (500 basis points)
  cancellationWindow: 24 * 60 * 60, // 24 hours in seconds
  maxBookingDuration: 30 * 24 * 60 * 60, // 30 days in seconds
} as const

// UI Configuration
export const UI_CONFIG = {
  itemsPerPage: 12,
  maxPropertyImages: 10,
  supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxImageSize: 5 * 1024 * 1024, // 5MB
} as const
