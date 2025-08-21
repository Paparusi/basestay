'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  StarIcon, 
  UserGroupIcon,
  AdjustmentsHorizontalIcon 
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

interface SearchResults {
  properties: Property[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  suggestions: string[]
  filters: {
    location: string | null
    guests: number
    minPrice: number
    maxPrice: number
    propertyType: string | null
    bedrooms: number | null
    amenities: string[]
    sortBy: string
    sortOrder: string
  }
}

export default function PropertiesPage() {
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  })

  // Advanced search filters
  const [location, setLocation] = useState(searchParams.get('location') || '')
  const [guests, setGuests] = useState(parseInt(searchParams.get('guests') || '1'))
  const [minPrice, setMinPrice] = useState(parseFloat(searchParams.get('minPrice') || '0'))
  const [maxPrice, setMaxPrice] = useState(parseFloat(searchParams.get('maxPrice') || '1000'))
  const [propertyType, setPropertyType] = useState(searchParams.get('propertyType') || '')
  const [bedrooms, setBedrooms] = useState(parseInt(searchParams.get('bedrooms') || '0'))
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'relevance')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    searchProperties()
  }, [location, guests, minPrice, maxPrice, propertyType, bedrooms, sortBy, currentPage])

  const searchProperties = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        location,
        guests: guests.toString(),
        minPrice: minPrice.toString(),
        maxPrice: maxPrice.toString(),
        propertyType,
        bedrooms: bedrooms.toString(),
        sortBy,
        page: currentPage.toString(),
        limit: pagination.limit.toString()
      })

      console.log('Searching with params:', params.toString())
      const response = await fetch(`/api/properties/search?${params}`)
      console.log('Search response status:', response.status)
      
      const data: SearchResults = await response.json()
      console.log('Search data:', data)

      if (response.ok) {
        setProperties(data.properties)
        setPagination(data.pagination)
        setSuggestions(data.suggestions || [])
        setError(null)
      } else {
        console.error('Search failed:', data)
        setError('Failed to load properties')
      }
    } catch (err) {
      console.error('Search error:', err)
      setError('Failed to search properties')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    searchProperties()
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              BaseStay
            </Link>
            <Link 
              href="/host" 
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              Become a Host
            </Link>
          </div>
        </div>
      </header>

      {/* Advanced Search Section */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Main search bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by city, district, or landmark (e.g., District 1, Ho Chi Minh City)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="w-48">
                <div className="relative">
                  <UserGroupIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {[1,2,3,4,5,6,7,8].map(num => (
                      <option key={num} value={num}>
                        {num} Guest{num > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Advanced Filters */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
              >
                <AdjustmentsHorizontalIcon className="h-4 w-4" />
                Advanced Filters
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="relevance">Most Relevant</option>
                <option value="newest">Newest First</option>
                <option value="price">Price: Low to High</option>
                <option value="rating">Best Rated</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            {/* Advanced filters panel */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range (USDC/night)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice || ''}
                      onChange={(e) => setMinPrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice || ''}
                      onChange={(e) => setMaxPrice(parseFloat(e.target.value) || 1000)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Any Type</option>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="villa">Villa</option>
                    <option value="studio">Studio</option>
                    <option value="condo">Condo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrooms
                  </label>
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="0">Any</option>
                    <option value="1">1+ Bedroom</option>
                    <option value="2">2+ Bedrooms</option>
                    <option value="3">3+ Bedrooms</option>
                    <option value="4">4+ Bedrooms</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      setLocation('')
                      setGuests(1)
                      setMinPrice(0)
                      setMaxPrice(1000)
                      setPropertyType('')
                      setBedrooms(0)
                      setSortBy('relevance')
                      setCurrentPage(1)
                    }}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Results */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Searching properties...</p>
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {pagination.total} Properties Found
                {location && ` in "${location}"`}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <AdjustmentsHorizontalIcon className="h-4 w-4" />
                <span>Filters</span>
              </div>
            </div>

            {/* Properties Grid */}
            {properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <MagnifyingGlassIcon className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Properties Found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or location.
                </p>
                
                {/* Search Suggestions */}
                {suggestions.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Popular destinations you might like:
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setLocation(suggestion)
                            setCurrentPage(1)
                          }}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={() => {
                    setLocation('')
                    setGuests(1)
                    setMinPrice(0)
                    setMaxPrice(1000)
                    setPropertyType('')
                    setBedrooms(0)
                    setCurrentPage(1)
                  }}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                    disabled={currentPage === pagination.pages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function PropertyCard({ property }: { property: Property }) {
  return (
    <Link href={`/property/${property.id}`} className="group">
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
        {/* Image */}
        <div className="relative h-48 bg-gray-200">
          {property.images && property.images.length > 0 && property.images[0] && property.images[0] !== 'placeholder.jpg' ? (
            <Image
              src={property.images[0].startsWith('http') ? property.images[0] : `/images/${property.images[0]}`}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : property.images && property.images.length > 0 && property.images[0] === 'placeholder.jpg' ? (
            <Image
              src="/images/placeholder.svg"
              alt={property.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
              <div className="text-blue-300 text-sm font-medium">🏠 Property Image</div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 line-clamp-1">
              {property.title}
            </h3>
            {property.reviewCount > 0 && (
              <div className="flex items-center gap-1 text-sm">
                <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="font-medium">{property.averageRating}</span>
                <span className="text-gray-500">({property.reviewCount})</span>
              </div>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
            <MapPinIcon className="h-4 w-4" />
            {property.location}
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <span>{property.maxGuests} guests</span>
            <span>{property.bedrooms} bed{property.bedrooms > 1 ? 's' : ''}</span>
            <span>{property.bathrooms} bath{property.bathrooms > 1 ? 's' : ''}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 capitalize">
              {property.propertyType}
            </span>
            <div className="text-right">
              <span className="text-lg font-bold text-gray-900">
                ${property.pricePerNight}
              </span>
              <span className="text-sm text-gray-500"> / night</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
