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

// Component để hiển thị khi chưa connect wallet
function ConnectWalletPrompt() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
        <p className="text-gray-600 mb-6">
          Connect your wallet to access your host dashboard and manage your properties.
        </p>
        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Connect Wallet
        </button>
      </div>
    </div>
  )
}

// Main dashboard component
function HostDashboardContent() {
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
          totalProperties: statsData.stats?.totalProperties || 0,
          activeBookings: statsData.stats?.activeBookings || 0,
          totalEarnings: statsData.stats?.totalEarnings || statsData.stats?.totalRevenue || 0,
          averageRating: statsData.stats?.averageRating || 0,
          totalViews: statsData.stats?.totalViews || 0
        })
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const togglePropertyStatus = async (propertyId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/host/properties/${propertyId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          isActive: !isActive,
          ownerAddress: address 
        })
      })

      if (response.ok) {
        setProperties(prev => 
          prev.map(p => 
            p.id === propertyId ? { ...p, isActive: !p.isActive } : p
          )
        )
      }
    } catch (error) {
      console.error('Error toggling property status:', error)
    }
  }

  if (!isConnected) {
    return <ConnectWalletPrompt />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <HomeIcon className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Host Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/host/properties/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Property
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'properties', name: 'Properties', icon: HomeIcon },
              { id: 'bookings', name: 'Bookings', icon: CalendarIcon },
              { id: 'earnings', name: 'Earnings', icon: CurrencyDollarIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 py-2 font-medium text-sm rounded-md ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading dashboard...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && !loading && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <HomeIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Properties
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.totalProperties}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CalendarIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Active Bookings
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.activeBookings}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Earnings
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          ${stats.totalEarnings}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <StarIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Average Rating
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.averageRating.toFixed(1)}/5.0
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Recent Bookings
                </h3>
                {bookings.length === 0 ? (
                  <p className="text-gray-500">No recent bookings</p>
                ) : (
                  <div className="space-y-3">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {booking.property.images[0] ? (
                              <img
                                src={booking.property.images[0]}
                                alt={booking.property.title}
                                className="h-10 w-10 rounded object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                                <HomeIcon className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {booking.property.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {booking.guests} guests • ${booking.totalAmount}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && !loading && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Your Properties</h2>
              <Link
                href="/host/properties/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add New Property
              </Link>
            </div>

            {properties.length === 0 ? (
              <div className="text-center py-12">
                <HomeIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No properties yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start earning by listing your first property.
                </p>
                <div className="mt-6">
                  <Link
                    href="/host/properties/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Property
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <div key={property.id} className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="relative h-48">
                      {property.images[0] ? (
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <HomeIcon className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          property.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {property.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{property.title}</h3>
                      <p className="text-sm text-gray-500 mb-3">{property.location}</p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <span className="flex items-center">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          {property.views} views
                        </span>
                        <span className="flex items-center">
                          <UsersIcon className="h-4 w-4 mr-1" />
                          {property.bookings} bookings
                        </span>
                        <span className="flex items-center">
                          <StarIcon className="h-4 w-4 mr-1" />
                          {property.rating.toFixed(1)} ({property.reviewCount})
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-bold text-gray-900">
                          ${property.pricePerNight}/night
                        </span>
                        <span className="text-sm text-green-600 font-medium">
                          ${property.totalEarnings.toLocaleString()} earned
                        </span>
                      </div>

                      <div className="flex space-x-2">
                        <Link
                          href={`/host/properties/${property.id}`}
                          className="flex-1 text-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => togglePropertyStatus(property.id, property.isActive)}
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md ${
                            property.isActive
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {property.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && !loading && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Booking Management</h2>
            
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Your bookings will appear here when guests book your properties.
                </p>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <li key={booking.id}>
                      <div className="px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {booking.property.images[0] ? (
                              <img
                                src={booking.property.images[0]}
                                alt={booking.property.title}
                                className="h-12 w-12 rounded object-cover"
                              />
                            ) : (
                              <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                                <HomeIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <h4 className="text-sm font-medium text-gray-900">
                                {booking.property.title}
                              </h4>
                              <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              {booking.guests} guests • {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              Guest: {booking.guest.name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ${booking.totalAmount}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === 'earnings' && !loading && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Earnings Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CurrencyDollarIcon className="h-6 w-6 text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total USDC Earned
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          ${stats.totalEarnings}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <EyeIcon className="h-6 w-6 text-purple-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Views
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.totalViews.toLocaleString()}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <StarIcon className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Average Rating
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stats.averageRating.toFixed(1)}★
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Earning Breakdown</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Property Bookings</span>
                  <span className="font-medium">${(stats.totalEarnings * 0.975)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Platform Fee (2.5%)</span>
                  <span className="font-medium text-red-600">-${(stats.totalEarnings * 0.025)}</span>
                </div>
                <div className="flex justify-between items-center py-2 font-semibold">
                  <span>Net Earnings</span>
                  <span className="text-green-600">${stats.totalEarnings}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Main export - wrapper component to avoid hooks rule violations  
export default function HostDashboard() {
  const { isConnected } = useAccount()
  
  if (!isConnected) {
    return <ConnectWalletPrompt />
  }
  
  return <HostDashboardContent />
}
