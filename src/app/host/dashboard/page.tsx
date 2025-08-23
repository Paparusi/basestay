'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { ConnectWallet } from '@coinbase/onchainkit/wallet'
import HostDashboard from '@/components/dashboard/HostDashboard'

export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false)
  const { address, isConnected } = useAccount()

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Always show loading during SSR and initial client render
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show wallet connection if not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h1>
            <p className="text-gray-600 mb-6">
              Connect your Web3 wallet to access your host dashboard and manage your properties on the Base network.
            </p>
            <div className="flex justify-center">
              <ConnectWallet />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show dashboard when connected
  return (
    <div className="min-h-screen bg-gray-50">
      <HostDashboard />
    </div>
  )
}
