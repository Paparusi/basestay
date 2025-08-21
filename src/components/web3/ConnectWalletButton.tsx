'use client'

import { useWeb3 } from './Web3Provider'
import { Button } from '@/components/ui/button'
import { formatAddress } from '@/lib/utils'

export function ConnectWalletButton() {
  const { isConnected, address, isConnecting, connect, disconnect } = useWeb3()

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          {formatAddress(address)}
        </span>
        <Button variant="outline" onClick={disconnect}>
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <Button 
      onClick={connect} 
      disabled={isConnecting}
      className="bg-blue-600 hover:bg-blue-700"
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  )
}
