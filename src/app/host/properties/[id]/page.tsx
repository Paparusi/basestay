'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWeb3 } from '@/components/web3/Web3Provider'
import Link from 'next/link'
import { 
  ArrowLeftIcon,
  HomeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  StarIcon,
  CalendarDaysIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

interface Property {
  id: string
  title: string
  description: string
  location: string
  pricePerNight: number
  maxGuests: number
  bedrooms: number
  bathrooms: number
  propertyType: string
  amenities: string[]
  images: string[]
  rules: string
  checkInTime: string
  checkOutTime: string
  isActive: boolean
  createdAt: string
  stats: {
    totalBookings: number
    totalEarnings: number
    averageRating: number
  }
}

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { address, isConnected } = useWeb3()
  const router = useRouter()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [propertyId, setPropertyId] = useState<string | null>(null)

  // Resolve params first
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setPropertyId(resolvedParams.id)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (isConnected && address && propertyId) {
      loadProperty()
    }
  }, [isConnected, address, propertyId])

  const loadProperty = async () => {
    if (!propertyId) return
    try {
      setLoading(true)
      const response = await fetch(`/api/properties/${propertyId}`)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Property not found')
      }

      // Check if user owns this property
      if (data.property.ownerAddress.toLowerCase() !== address?.toLowerCase()) {
        throw new Error('You do not have permission to view this property')
      }

      setProperty(data.property)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!property || !propertyId) return

    const confirmed = confirm(`Are you sure you want to delete "${property.title}"? This action cannot be undone.`)
    if (!confirmed) return

    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete property')
      }

      router.push('/host?success=property-deleted')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete property')
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <HomeIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Connect Wallet Required</h1>
          <p className="text-gray-600 mb-6">Please connect your wallet to view property details</p>
          <Link
            href="/host"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading property...</p>
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <HomeIcon className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
          <p className="text-red-600 mb-6">{error}</p>
          <Link
            href="/host"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/host" className="mr-4">
                <ArrowLeftIcon className="h-6 w-6 text-gray-600 hover:text-gray-900" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href={`/host/properties/${property.id}/edit`}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Property Images */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="h-64 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <HomeIcon className="h-24 w-24 text-white" />
          </div>
          <div className="p-4 text-sm text-gray-500">
            Property images will be displayed here once photo upload is implemented
          </div>
        </div>

        {/* Property Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Property Details</h2>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  property.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {property.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span>{property.location}</span>
                </div>
                <div className="flex items-center">
                  <HomeIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span>{property.propertyType}</span>
                </div>
                <div className="flex items-center">
                  <UserGroupIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span>{property.maxGuests} guests</span>
                </div>
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span>${property.pricePerNight} USDC/night</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{property.description}</p>
              </div>

              <div className="mt-4 pt-4 border-t">
                <h3 className="font-medium text-gray-900 mb-2">Accommodation</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">{property.bedrooms}</span>
                    <span className="text-gray-500 ml-1">Bedrooms</span>
                  </div>
                  <div>
                    <span className="font-medium">{property.bathrooms}</span>
                    <span className="text-gray-500 ml-1">Bathrooms</span>
                  </div>
                  <div>
                    <span className="font-medium">{property.maxGuests}</span>
                    <span className="text-gray-500 ml-1">Max Guests</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 gap-2">
                {property.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    {amenity}
                  </div>
                ))}
              </div>
            </div>

            {/* Rules */}
            {property.rules && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">House Rules</h2>
                <p className="text-gray-700">{property.rules}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Performance Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CalendarDaysIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Total Bookings</span>
                  </div>
                  <span className="font-semibold">{property.stats.totalBookings}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Total Earnings</span>
                  </div>
                  <span className="font-semibold">${property.stats.totalEarnings}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <StarIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Average Rating</span>
                  </div>
                  <span className="font-semibold">{property.stats.averageRating.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Check-in/out Times */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Check-in Details</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in</span>
                  <span className="font-medium">{property.checkInTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-out</span>
                  <span className="font-medium">{property.checkOutTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium">
                    {new Date(property.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              
              <div className="space-y-3">
                <Link
                  href={`/property/${property.id}`}
                  className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <EyeIcon className="h-4 w-4 inline mr-2" />
                  View as Guest
                </Link>
                
                <Link
                  href={`/host/properties/${property.id}/edit`}
                  className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <PencilIcon className="h-4 w-4 inline mr-2" />
                  Edit Property
                </Link>
                
                <Link
                  href={`/host/properties/${property.id}/bookings`}
                  className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <CalendarDaysIcon className="h-4 w-4 inline mr-2" />
                  View Bookings
                </Link>
                
                <button
                  onClick={handleDelete}
                  className="block w-full text-center px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                >
                  <TrashIcon className="h-4 w-4 inline mr-2" />
                  Delete Property
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
