'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  StarIcon, 
  UserGroupIcon,
  AdjustmentsHorizontalIcon,
  HeartIcon
} from '@heroicons/react/24/outline'

// Dynamic import for filters
const PropertyFilters = dynamic(() => import('@/components/PropertyFilters'), {
  loading: () => <div className="animate-pulse h-96 bg-gray-200 rounded-lg"></div>,
  ssr: false
})

interface Property {
  id: string
  title: string
  description: string
  location: string
  pricePerNight: number
  maxGuests: number
  bedrooms: number
  bathrooms: number
  images: string[]
  propertyType: string
  averageRating: number
  reviewCount: number
  owner: {
    displayName: string
    avatar: string | null
    isVerified: boolean
  }
}

// Optimized Property Card Component
const PropertyCard = React.memo(({ property }: { property: Property }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="relative">
        <Link href={`/properties/${property.id}`}>
          <div className="relative h-48 sm:h-56 bg-gray-200">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-t-xl"></div>
            )}
            <Image
              src={property.images[0] || '/images/placeholder.jpg'}
              alt={property.title}
              fill
              className={`object-cover rounded-t-xl transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />
          </div>
        </Link>
        
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
            isFavorite 
              ? 'bg-red-500 text-white' 
              : 'bg-white text-gray-600 hover:text-red-500'
          }`}
        >
          <HeartIcon className="h-5 w-5" fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <Link href={`/properties/${property.id}`}>
              <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1">
                {property.title}
              </h3>
            </Link>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="line-clamp-1">{property.location}</span>
            </div>
          </div>
          
          {property.averageRating > 0 && (
            <div className="flex items-center ml-2">
              <StarIcon className="h-4 w-4 text-yellow-400" fill="currentColor" />
              <span className="text-sm font-medium text-gray-900 ml-1">
                {property.averageRating.toFixed(1)}
              </span>
              <span className="text-sm text-gray-500 ml-1">
                ({property.reviewCount})
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-3 text-sm text-gray-600">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <UserGroupIcon className="h-4 w-4 mr-1" />
              <span>{property.maxGuests} guests</span>
            </div>
            <span>•</span>
            <span>{property.bedrooms} bed</span>
            <span>•</span>
            <span>{property.bathrooms} bath</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-gray-900">
              ${property.pricePerNight}
            </span>
            <span className="text-sm text-gray-500 ml-1">per night</span>
          </div>
          
          <Link
            href={`/properties/${property.id}`}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
})

PropertyCard.displayName = 'PropertyCard'

// Skeleton Component
const PropertySkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 animate-pulse">
    <div className="h-48 sm:h-56 bg-gray-200"></div>
    <div className="p-4">
      <div className="h-6 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
      <div className="flex justify-between items-center mb-3">
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
      <div className="flex justify-between items-center">
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  </div>
)

export default function PropertiesPageOptimized() {
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  
  // Parse search parameters
  const searchQuery = searchParams.get('search') || ''
  const locationQuery = searchParams.get('location') || ''
  
  // Optimized search function with debouncing
  const searchProperties = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Simulate faster API call
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Mock optimized data
      const mockProperties: Property[] = [
        {
          id: '1',
          title: 'Modern Downtown Apartment',
          description: 'Beautiful 2-bedroom apartment in the heart of downtown',
          location: 'Downtown, City Center',
          pricePerNight: 120,
          maxGuests: 4,
          bedrooms: 2,
          bathrooms: 2,
          images: ['/images/property1.jpg', '/images/property1-2.jpg'],
          propertyType: 'Apartment',
          averageRating: 4.8,
          reviewCount: 24,
          owner: {
            displayName: 'John Smith',
            avatar: '/images/avatar1.jpg',
            isVerified: true
          }
        },
        {
          id: '2',
          title: 'Cozy Beach House',
          description: 'Oceanfront property with stunning beach views',
          location: 'Beachside, Coastal Area',
          pricePerNight: 200,
          maxGuests: 6,
          bedrooms: 3,
          bathrooms: 2,
          images: ['/images/property2.jpg', '/images/property2-2.jpg'],
          propertyType: 'House',
          averageRating: 4.9,
          reviewCount: 18,
          owner: {
            displayName: 'Sarah Johnson',
            avatar: '/images/avatar2.jpg',
            isVerified: true
          }
        },
        {
          id: '3',
          title: 'Mountain Cabin Retreat',
          description: 'Peaceful cabin surrounded by nature',
          location: 'Mountain View, Countryside',
          pricePerNight: 80,
          maxGuests: 4,
          bedrooms: 2,
          bathrooms: 1,
          images: ['/images/property3.jpg'],
          propertyType: 'Cabin',
          averageRating: 4.6,
          reviewCount: 12,
          owner: {
            displayName: 'Mike Wilson',
            avatar: '/images/avatar3.jpg',
            isVerified: false
          }
        },
        {
          id: '4',
          title: 'Luxury City Loft',
          description: 'Spacious loft with modern amenities',
          location: 'Uptown, Business District',
          pricePerNight: 180,
          maxGuests: 2,
          bedrooms: 1,
          bathrooms: 1,
          images: ['/images/property4.jpg'],
          propertyType: 'Loft',
          averageRating: 4.7,
          reviewCount: 31,
          owner: {
            displayName: 'Emma Davis',
            avatar: '/images/avatar4.jpg',
            isVerified: true
          }
        }
      ]
      
      // Filter based on search query
      const filtered = mockProperties.filter(property =>
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.toLowerCase().includes(locationQuery.toLowerCase()) ||
        property.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
      
      setProperties(filtered)
    } catch (error) {
      console.error('Error fetching properties:', error)
      setError('Failed to load properties')
    } finally {
      setLoading(false)
    }
  }, [searchQuery, locationQuery])

  useEffect(() => {
    searchProperties()
  }, [searchProperties])

  // Memoized filtered results count
  const resultsCount = useMemo(() => properties.length, [properties])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl font-semibold mb-4">Error Loading Properties</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={searchProperties}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search properties..."
                  defaultValue={searchQuery}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="ml-4 flex items-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
              Filters
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {searchQuery ? `Search results for "${searchQuery}"` : 'All Properties'}
            </h1>
            <p className="text-gray-600 mt-1">
              {loading ? 'Loading...' : `${resultsCount} propert${resultsCount !== 1 ? 'ies' : 'y'} available`}
            </p>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <PropertyFilters onFiltersChange={() => {}} />
          </div>
        )}

        {/* Properties Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <PropertySkeleton key={i} />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No properties found</h3>
            <p className="mt-2 text-gray-600">
              Try adjusting your search criteria or browse all properties.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
