'use client'

import { useState, useEffect, memo } from 'react'
import { useAccount } from 'wagmi'
import Link from 'next/link'
import Image from 'next/image'
import { 
  PlusIcon,
  PencilIcon,
  EyeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  StarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

interface Property {
  id: string
  title: string
  description: string
  location: string
  pricePerNight: number
  images: string[]
  status: 'active' | 'inactive' | 'pending'
  totalBookings: number
  averageRating: number
  totalEarnings: number
  createdAt: string
}

const PropertyCard = memo(({ property }: { property: Property }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        {property.images?.[0] ? (
          <Image
            src={property.images[0]}
            alt={property.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            property.status === 'active' 
              ? 'bg-green-100 text-green-800'
              : property.status === 'inactive'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {property.status}
          </span>
        </div>
      </div>
      
      <div className="p-5">
        <div className="mb-3">
          <h3 className="text-lg font-medium text-gray-900 line-clamp-1">
            {property.title}
          </h3>
          <div className="flex items-center mt-1 text-sm text-gray-500">
            <MapPinIcon className="h-4 w-4 mr-1" />
            <span className="line-clamp-1">{property.location}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-4 w-4 text-green-600 mr-1" />
            <span className="font-medium">${property.pricePerNight}/night</span>
          </div>
          
          <div className="flex items-center">
            <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
            <span>{property.averageRating.toFixed(1)}</span>
          </div>
          
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 text-blue-600 mr-1" />
            <span>{property.totalBookings} bookings</span>
          </div>
          
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-4 w-4 text-purple-600 mr-1" />
            <span>${property.totalEarnings}</span>
          </div>
        </div>

        <div className="flex space-x-2">
          <Link
            href={`/properties/${property.id}`}
            className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            View
          </Link>
          
          <Link
            href={`/host/properties/${property.id}/edit`}
            className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            Edit
          </Link>
        </div>
      </div>
    </div>
  )
})

PropertyCard.displayName = 'PropertyCard'

const PropertySkeleton = () => (
  <div className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-200"></div>
    <div className="p-5">
      <div className="h-5 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded"></div>
        ))}
      </div>
      <div className="flex space-x-2">
        <div className="flex-1 h-8 bg-gray-200 rounded"></div>
        <div className="flex-1 h-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
)

export default function PropertiesTab() {
  const { address, isConnected } = useAccount()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProperties = async () => {
      if (!isConnected || !address) return

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/host/properties?owner=${address}`)
        
        if (!response.ok) {
          throw new Error('Failed to load properties')
        }

        const data = await response.json()
        setProperties(data.properties || [])
      } catch (error) {
        console.error('Error loading properties:', error)
        setError('Failed to load properties')
        
        // Mock data for development
        setProperties([
          {
            id: '1',
            title: 'Modern Downtown Apartment',
            description: 'Beautiful 2-bedroom apartment in the heart of downtown',
            location: 'Downtown, City Center',
            pricePerNight: 120,
            images: ['/images/property1.jpg'],
            status: 'active',
            totalBookings: 15,
            averageRating: 4.8,
            totalEarnings: 1800,
            createdAt: '2024-01-15'
          },
          {
            id: '2',
            title: 'Cozy Beach House',
            description: 'Oceanfront property with stunning views',
            location: 'Beachside, Coastal Area',
            pricePerNight: 200,
            images: ['/images/property2.jpg'],
            status: 'active',
            totalBookings: 8,
            averageRating: 4.9,
            totalEarnings: 1600,
            createdAt: '2024-02-01'
          },
          {
            id: '3',
            title: 'Mountain Cabin Retreat',
            description: 'Peaceful cabin surrounded by nature',
            location: 'Mountain View, Countryside',
            pricePerNight: 80,
            images: ['/images/property3.jpg'],
            status: 'inactive',
            totalBookings: 3,
            averageRating: 4.5,
            totalEarnings: 240,
            createdAt: '2024-02-10'
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    loadProperties()
  }, [isConnected, address])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <PropertySkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Properties</h2>
          <p className="text-gray-600 mt-1">
            Manage your {properties.length} propert{properties.length !== 1 ? 'ies' : 'y'}
          </p>
        </div>
        
        <Link
          href="/host/properties/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Property
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {properties.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0V9a1 1 0 011-1h4a1 1 0 011 1v4" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No properties</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your first property listing.</p>
          <div className="mt-6">
            <Link
              href="/host/properties/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add your first property
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  )
}
