'use client'

import { ReactNode, useState, useEffect } from 'react'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { OnchainKitProvider } from '@coinbase/onchainkit'
import { base } from 'wagmi/chains'
import { coinbaseWallet, metaMask } from 'wagmi/connectors'

// Host-specific wagmi config with SSR disabled
const hostConfig = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({ 
      appName: 'BaseStay Host',
      appLogoUrl: 'https://basestay.io/logo.png'
    }),
    metaMask({
      dappMetadata: {
        name: 'BaseStay Host',
        url: 'https://basestay.io'
      }
    })
  ],
  transports: {
    [base.id]: http('https://mainnet.base.org')
  },
  ssr: false // Disable SSR to prevent hydration issues
})

const hostQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
})

interface HostWeb3ProviderProps {
  children: ReactNode
}

export function HostWeb3Provider({ children }: HostWeb3ProviderProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Initializing Web3...</p>
        </div>
      </div>
    )
  }

  return (
    <WagmiProvider config={hostConfig}>
      <QueryClientProvider client={hostQueryClient}>
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
