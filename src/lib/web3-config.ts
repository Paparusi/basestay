import { base } from 'wagmi/chains'

export const baseChain = {
  ...base,
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org']
    },
    public: {
      http: ['https://mainnet.base.org']
    }
  }
}

// Contract addresses (to be updated after deployment)
export const CONTRACT_ADDRESSES = {
  PROPERTY_REGISTRY: process.env.NEXT_PUBLIC_PROPERTY_REGISTRY_ADDRESS || '',
  BOOKING_MANAGER: process.env.NEXT_PUBLIC_BOOKING_MANAGER_ADDRESS || '',
  REVIEW_SYSTEM: process.env.NEXT_PUBLIC_REVIEW_SYSTEM_ADDRESS || '',
  BST_TOKEN: process.env.NEXT_PUBLIC_BST_TOKEN_ADDRESS || '',
  USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' // Base mainnet USDC
} as const

// Base Account SDK configuration
export const BASE_ACCOUNT_CONFIG = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'BaseStay',
  appLogoUrl: process.env.NEXT_PUBLIC_APP_LOGO_URL || '/logo.png',
}

// OnchainKit configuration
export const ONCHAINKIT_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_CDP_API_KEY || '',
  chain: baseChain,
}

// USDC Configuration
export const USDC_CONFIG = {
  address: CONTRACT_ADDRESSES.USDC,
  decimals: 6,
  symbol: 'USDC',
  name: 'USD Coin'
} as const

// BST Token Configuration
export const BST_CONFIG = {
  address: CONTRACT_ADDRESSES.BST_TOKEN,
  decimals: 18,
  symbol: 'BST',
  name: 'BaseStay Token',
  totalSupply: '10000000000', // 10 billion
  minHostStake: '1000' // 1000 BST minimum
} as const
