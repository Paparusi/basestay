'use client'

import { useEffect, useState, Suspense } from 'react'
import { usePathname } from 'next/navigation'
import ErrorBoundary from '@/components/ErrorBoundary'

// Simple loading component
function HostLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading host dashboard...</p>
      </div>
    </div>
  )
}

export default function HostClientWrapper({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    try {
      // Ensure we're fully mounted on client
      setIsClient(true)
      console.log('✅ HostClientWrapper mounted, pathname:', pathname)
    } catch (error) {
      console.error('❌ Error in HostClientWrapper mount:', error)
    }
  }, [pathname])

  // Always show loading during SSR and initial hydration
  if (!isClient) {
    return <HostLoading />
  }

  // Redirect /host to /host/dashboard on client side
  useEffect(() => {
    try {
      if (pathname === '/host') {
        console.log('🔄 Redirecting /host to /host/dashboard')
        window.location.replace('/host/dashboard')
        return
      }
    } catch (error) {
      console.error('❌ Error in redirect logic:', error)
    }
  }, [pathname])

  if (pathname === '/host') {
    return <HostLoading />
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<HostLoading />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}
