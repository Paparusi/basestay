'use client'

import { ReactNode } from 'react'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { OnchainKitProvider } from '@coinbase/onchainkit'
import { base } from 'wagmi/chains'
import { coinbaseWallet, metaMask } from 'wagmi/connectors'

// Create wagmi config with proper connectors
const config = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({ 
      appName: 'BaseStay',
      appLogoUrl: 'https://basestay.io/logo.png'
    }),
    metaMask({
      dappMetadata: {
        name: 'BaseStay',
        url: 'https://basestay.io'
      }
    })
  ],
  transports: {
    [base.id]: http('https://mainnet.base.org')
  },
  ssr: true
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

interface Web3ProviderProps {
  children: ReactNode
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_CDP_API_KEY}
          chain={base}
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

// For backward compatibility
export const useWeb3 = () => {
  console.warn('useWeb3 is deprecated, use wagmi hooks directly')
  return { isConnected: false, address: null }
}
