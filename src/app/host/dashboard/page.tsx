'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Completely disable SSR for Web3 components
const DynamicWalletContent = dynamic(() => import('./WalletContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading Web3 components...</p>
      </div>
    </div>
  )
})

export default function DashboardPage() {
  return <DynamicWalletContent />
}
