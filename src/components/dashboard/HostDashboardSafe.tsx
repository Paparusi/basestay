'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { 
  PlusIcon, 
  HomeIcon, 
  CalendarIcon, 
  CurrencyDollarIcon,
  EyeIcon,
  StarIcon,
  UsersIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

// Safe number formatting utilities
const safeNumber = (value: number | undefined | null): number => value || 0
const safeToFixed = (value: number | undefined | null, digits: number = 2): string => 
  safeNumber(value).toFixed(digits)

interface Property {
  id: string
  title: string
  location: string
  pricePerNight: number
  isActive: boolean
  images: string[]
  views: number
  bookings: number
  rating: number
  reviewCount: number
  totalEarnings: number
  createdAt: string
}

interface Booking {
  id: string
  propertyId: string
  property: {
    title: string
    images: string[]
  }
  guest: {
    name: string
    email: string
    avatar?: string
  }
  checkIn: string
  checkOut: string
  guests: number
  totalAmount: number
  status: 'confirmed' | 'cancelled' | 'completed' | 'pending'
  createdAt: string
}

interface DashboardStats {
  totalProperties: number
  activeBookings: number
  totalEarnings: number
  averageRating: number
  totalViews: number
}

export default function HostDashboardSafe() {
  const { address, isConnected } = useAccount()
  
  const [activeTab, setActiveTab] = useState('overview')
  const [properties, setProperties] = useState<Property[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    activeBookings: 0,
    totalEarnings: 0,
    averageRating: 0,
    totalViews: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isConnected && address) {
      loadDashboardData()
    }
  }, [isConnected, address])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load properties
      const propertiesResponse = await fetch(`/api/properties?ownerAddress=${address}`)
      if (propertiesResponse.ok) {
        const propertiesData = await propertiesResponse.json()
        setProperties(propertiesData.properties || [])
      }

      // Load bookings
      const bookingsResponse = await fetch(`/api/host/bookings?owner=${address}`)
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json()
        setBookings(bookingsData.bookings || [])
      }

      // Load stats
      const statsResponse = await fetch(`/api/host/stats?owner=${address}`)
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        // Map API response to component state
        setStats({
          totalProperties: safeNumber(statsData.stats?.totalProperties),
          activeBookings: safeNumber(statsData.stats?.activeBookings),
          totalEarnings: safeNumber(statsData.stats?.totalEarnings || statsData.stats?.totalRevenue),
          averageRating: safeNumber(statsData.stats?.averageRating),
          totalViews: safeNumber(statsData.stats?.totalViews)
        })
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-900 mb-4">Connect Your Wallet</div>
          <p className="text-gray-600">Please connect your wallet to view your host dashboard.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Host Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back! Manage your properties and bookings.</p>
          </div>
          <Link href="/host/properties/new">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center">
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Property
            </button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <HomeIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Properties</p>
                <p className="text-2xl font-bold text-gray-900">{safeNumber(stats.totalProperties)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{safeNumber(stats.activeBookings)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">${safeToFixed(stats.totalEarnings)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <StarIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">{safeToFixed(stats.averageRating, 1)}★</p>
              </div>
            </div>
          </div>
        </div>

        {/* Properties List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Properties</h2>
          </div>
          <div className="p-6">
            {properties.length === 0 ? (
              <div className="text-center py-12">
                <HomeIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No properties</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first property listing.
                </p>
                <div className="mt-6">
                  <Link href="/host/properties/new">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                      Add Property
                    </button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <div key={property.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="aspect-w-3 aspect-h-2 mb-4">
                      <img
                        src={property.images?.[0] || '/images/placeholder.svg'}
                        alt={property.title}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{property.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{property.location}</p>
                    <p className="text-lg font-bold text-blue-600">${safeNumber(property.pricePerNight)}/night</p>
                    <div className="mt-4 flex justify-between items-center">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        property.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {property.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <Link href={`/host/properties/${property.id}`}>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Manage
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
          </div>
          <div className="p-6">
            {bookings.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No bookings yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{booking.property.title}</h4>
                      <p className="text-sm text-gray-600">Guest: {booking.guest.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${safeNumber(booking.totalAmount)}</p>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        booking.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
