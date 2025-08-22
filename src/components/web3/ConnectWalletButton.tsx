'use client'

import { useAccount, useDisconnect } from 'wagmi'
import { ConnectWallet } from '@coinbase/onchainkit/wallet'

export const ConnectWalletButton = () => {
  const { address, isConnected, connector } = useAccount()
  const { disconnect } = useDisconnect()

  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-green-700 hidden sm:inline">
              {`${address.slice(0, 6)}...${address.slice(-4)}`}
            </span>
            <span className="text-sm font-medium text-green-700 sm:hidden">
              Connected
            </span>
            {connector && (
              <span className="text-xs text-green-600 hidden sm:inline">
                via {connector.name}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => disconnect()}
          className="text-sm text-gray-500 hover:text-gray-700 hidden sm:inline"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <ConnectWallet>
      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm">
        <span className="hidden sm:inline">Connect Wallet</span>
        <span className="sm:hidden">Connect</span>
      </button>
    </ConnectWallet>
  )
}
