'use client'

import { ReactNode } from 'react'
import dynamic from 'next/dynamic'
import ErrorBoundary from '@/components/ErrorBoundary'

// Dynamic import of Web3Provider with no SSR to avoid hydration issues
const Web3Provider = dynamic(() => import('./Web3Provider').then(mod => ({ default: mod.Web3Provider })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  )
})

interface ConditionalWeb3ProviderProps {
  children: ReactNode
}

export const ConditionalWeb3Provider = ({ children }: ConditionalWeb3ProviderProps) => {
  return (
    <ErrorBoundary>
      <Web3Provider>{children}</Web3Provider>
    </ErrorBoundary>
  )
}
