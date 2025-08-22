'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { MagnifyingGlassIcon, MapPinIcon, FunnelIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import Link from 'next/link'

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
    avatar: string
    isVerified: boolean
  }
}

const PropertyCard = ({ property }: { property: Property }) => (
  <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
    <div className="relative h-48">
      {property.images?.[0] ? (
        <Image
          src={property.images[0]}
          alt={property.title}
          fill
          className="object-cover rounded-t-lg"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ) : (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-t-lg">
          <span className="text-gray-400">No image</span>
        </div>
      )}
      <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full text-sm font-medium">
        ★ {property.averageRating.toFixed(1)}
      </div>
    </div>
    
    <div className="p-4">
      <h3 className="font-semibold text-lg mb-1">{property.title}</h3>
      <div className="flex items-center text-gray-500 text-sm mb-2">
        <MapPinIcon className="h-4 w-4 mr-1" />
        {property.location}
      </div>
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{property.description}</p>
      
      <div className="flex items-center justify-between">
        <div className="text-lg font-bold">
          ${property.pricePerNight}
          <span className="text-sm font-normal text-gray-500">/night</span>
        </div>
        <Link
          href={`/properties/${property.id}`}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  </div>
)

const PropertySkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm border animate-pulse">
    <div className="h-48 bg-gray-200 rounded-t-lg"></div>
    <div className="p-4">
      <div className="h-5 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
      <div className="h-12 bg-gray-200 rounded mb-3"></div>
      <div className="flex justify-between items-center">
        <div className="h-6 bg-gray-200 rounded w-20"></div>
        <div className="h-8 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  </div>
)

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [locationQuery, setLocationQuery] = useState('')

  const searchProperties = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Create API search endpoint that will fetch from database
      const params = new URLSearchParams({
        search: searchQuery,
        location: locationQuery,
        maxGuests: '1',
        minPrice: '0',
        maxPrice: '10000'
      })
      
      const response = await fetch(`/api/properties/search?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        setProperties(data.properties || [])
      } else {
        setProperties([])
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
      setError('Failed to load properties')
      setProperties([])
    } finally {
      setLoading(false)
    }
  }, [searchQuery, locationQuery])

  useEffect(() => {
    searchProperties()
  }, [searchProperties])

  const resultsCount = useMemo(() => properties.length, [properties])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl font-semibold mb-4">Error Loading Properties</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={searchProperties}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Find Your Perfect Stay</h1>
          
          {/* Search Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Location..."
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={searchProperties}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="text-gray-600">
            {loading ? 'Searching...' : `${resultsCount} properties found`}
          </div>
          <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
            <FunnelIcon className="h-5 w-5" />
            <span>Filters</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <PropertySkeleton key={i} />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-xl mb-4">No properties found</div>
            <p className="text-gray-500">Try adjusting your search criteria or browse all available properties.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
