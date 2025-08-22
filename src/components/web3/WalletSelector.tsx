'use client'

import { useState, useEffect, useRef } from 'react'
import { useConnect, useAccount } from 'wagmi'
import { ConnectWallet } from '@coinbase/onchainkit/wallet'

export const WalletSelector = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { connectors, connect, isPending } = useConnect()
  const { isConnected } = useAccount()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (isConnected) return null

  const walletIcons: { [key: string]: string } = {
    'Coinbase Wallet': '🔷',
    'MetaMask': '🦊', 
    'WalletConnect': '🌐'
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm flex items-center space-x-2"
        disabled={isPending}
      >
        <span className="hidden sm:inline">
          {isPending ? 'Connecting...' : 'Connect Wallet'}
        </span>
        <span className="sm:hidden">
          {isPending ? 'Connecting...' : 'Connect'}
        </span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg min-w-48 z-50">
          <div className="p-2">
            <div className="text-xs text-gray-500 font-medium mb-2 px-2">Choose Wallet</div>
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => {
                  connect({ connector })
                  setIsOpen(false)
                }}
                disabled={isPending}
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                <span className="text-lg">
                  {walletIcons[connector.name] || '💳'}
                </span>
                <span className="font-medium">{connector.name}</span>
                {isPending && (
                  <div className="ml-auto">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
          
          {/* OnchainKit Fallback */}
          <div className="border-t border-gray-100 p-2">
            <div className="text-xs text-gray-500 font-medium mb-2 px-2">Or use OnchainKit</div>
            <ConnectWallet>
              <button className="w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors font-medium">
                OnchainKit Connect
              </button>
            </ConnectWallet>
          </div>
        </div>
      )}
    </div>
  )
}
