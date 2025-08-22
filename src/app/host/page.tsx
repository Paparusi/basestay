import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Host Dashboard - BaseStay',
  description: 'Manage your properties on BaseStay',
}

export default function HostPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Host Dashboard</h1>
          <p className="text-gray-600 mb-8">Loading your dashboard...</p>
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
      
      {/* Load Web3 content only on client side */}
      <script 
        dangerouslySetInnerHTML={{
          __html: `
            if (typeof window !== 'undefined') {
              window.location.href = '/host/dashboard';
            }
          `
        }}
      />
    </div>
  )
}
