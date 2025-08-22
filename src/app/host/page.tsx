'use client'

import dynamic from 'next/dynamic'

// Dynamically import components to avoid hydration issues
const DynamicHostContent = dynamic(() => import('./HostContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
})

export default function HostPage() {
  return <DynamicHostContent />
}
