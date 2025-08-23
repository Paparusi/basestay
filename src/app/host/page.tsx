'use client'

import { useEffect } from 'react'

export default function HostPage() {
  useEffect(() => {
    // Redirect immediately on client side
    window.location.replace('/host/dashboard')
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Host Dashboard</h1>
          <p className="text-gray-600 mb-8">Redirecting to dashboard...</p>
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    </div>
  )
}
