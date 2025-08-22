import BSTDashboard from '@/components/BST/BSTDashboard'

export default function BSTPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">BaseStay Token (BST)</h1>
          <p className="mt-2 text-gray-600">
            Manage your BST tokens, stake for host privileges, and earn rewards on the BaseStay platform.
          </p>
        </div>
        
        <BSTDashboard />
      </div>
    </div>
  )
}
