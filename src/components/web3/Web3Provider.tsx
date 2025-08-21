'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { OnchainKitProvider } from '@coinbase/onchainkit'
import { baseChain, ONCHAINKIT_CONFIG, BASE_ACCOUNT_CONFIG } from '@/lib/web3-config'

const config = createConfig({
  chains: [baseChain],
  transports: {
    [baseChain.id]: http()
  }
})

const queryClient = new QueryClient()

interface Web3ContextType {
  isConnected: boolean
  address?: string
  isConnecting: boolean
  connect: () => Promise<void>
  disconnect: () => void
}

const Web3Context = createContext<Web3ContextType>({
  isConnected: false,
  isConnecting: false,
  connect: async () => {},
  disconnect: () => {}
})

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string>()
  const [isConnecting, setIsConnecting] = useState(false)

  const connect = async () => {
    try {
      setIsConnecting(true)
      
      // Check if Base Account SDK is loaded
      if (!(window as unknown as { createBaseAccountSDK?: () => { getProvider: () => unknown } }).createBaseAccountSDK) {
        throw new Error('Base Account SDK not loaded. Please refresh the page.')
      }
      
      // Initialize Base Account SDK using global window object (as per Base docs)
      const provider = (window as unknown as { 
        createBaseAccountSDK: (config: { appName: string; appLogoUrl: string }) => { 
          getProvider: () => { 
            request: (params: { method: string; params?: unknown[] }) => Promise<unknown> 
          } 
        }
      }).createBaseAccountSDK({
        appName: BASE_ACCOUNT_CONFIG.appName,
        appLogoUrl: BASE_ACCOUNT_CONFIG.appLogoUrl,
      }).getProvider()

      // Generate nonce for authentication (as per Base docs)
      const nonce = crypto.randomUUID().replace(/-/g, '')
      
      // Connect and authenticate using wallet_connect method (Base standard)
      const response = await provider.request({
        method: 'wallet_connect',
        params: [{
          version: '1',
          capabilities: {
            signInWithEthereum: { 
              nonce, 
              chainId: '0x2105' // Base Mainnet - 8453
            }
          }
        }]
      }) as { accounts: Array<{ address: string, capabilities?: { signInWithEthereum?: { message: string, signature: string } } }> }
      
      const { address } = response.accounts[0]
      const authData = response.accounts[0].capabilities?.signInWithEthereum
      setAddress(address)
      setIsConnected(true)
      
      // Store authentication data in localStorage for persistence
      if (authData) {
        localStorage.setItem('basestay_auth', JSON.stringify(authData))
      }
      localStorage.setItem('basestay_wallet', address)
      
    } catch (error) {
      console.error('Connection failed:', error)
      throw error
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    setIsConnected(false)
    setAddress(undefined)
    localStorage.removeItem('basestay_wallet')
  }

  // Check for existing connection on mount
  useEffect(() => {
    const savedWallet = localStorage.getItem('basestay_wallet')
    if (savedWallet) {
      setAddress(savedWallet)
      setIsConnected(true)
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        {ONCHAINKIT_CONFIG.apiKey && ONCHAINKIT_CONFIG.apiKey !== 'your_cdp_api_key_here' ? (
          <OnchainKitProvider
            apiKey={ONCHAINKIT_CONFIG.apiKey}
            chain={baseChain}
          >
            <Web3Context.Provider value={{
              isConnected,
              address,
              isConnecting,
              connect,
              disconnect
            }}>
              {children}
            </Web3Context.Provider>
          </OnchainKitProvider>
        ) : (
          <Web3Context.Provider value={{
            isConnected,
            address,
            isConnecting,
            connect,
            disconnect
          }}>
            {children}
          </Web3Context.Provider>
        )}
      </WagmiProvider>
    </QueryClientProvider>
  )
}

export const useWeb3 = () => {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error('useWeb3 must be used within Web3Provider')
  }
  return context
}
