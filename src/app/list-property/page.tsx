import PropertyListing from '@/components/property/PropertyListing'

export default function ListPropertyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">List Your Property</h1>
          <p className="mt-2 text-gray-600">
            Join BaseStay and start earning with your property. Stake BST tokens to get started.
          </p>
        </div>
        
        <PropertyListing />
      </div>
    </div>
  )
}
