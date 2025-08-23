'use client'

import { useEffect, useState, Suspense } from 'react'
import { usePathname } from 'next/navigation'

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
    // Ensure we're fully mounted on client
    setIsClient(true)
  }, [])

  // Always show loading during SSR and initial hydration
  if (!isClient) {
    return <HostLoading />
  }

  // Redirect /host to /host/dashboard on client side
  useEffect(() => {
    if (pathname === '/host') {
      window.location.replace('/host/dashboard')
    }
  }, [pathname])

  if (pathname === '/host') {
    return <HostLoading />
  }

  return (
    <Suspense fallback={<HostLoading />}>
      {children}
    </Suspense>
  )
}
