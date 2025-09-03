'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HostPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to host dashboard
    router.replace('/host/dashboard')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">BaseStay Host</h1>
          <p className="text-gray-600 mb-8">Redirecting to your dashboard...</p>
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-500 mt-4">
            If this takes too long, <a href="/host/dashboard" className="text-blue-600 underline">click here</a>
          </p>
        </div>
      </div>
    </div>
  )
}
