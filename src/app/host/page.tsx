'use client'

import { useState, useEffect } from 'react'
import { ConnectWalletButton } from '@/components/web3/ConnectWalletButton'
import { useWeb3 } from '@/components/web3/Web3Provider'
import Link from 'next/link'
import { 
  HomeIcon, 
  CalendarDaysIcon, 
  CurrencyDollarIcon, 
  ChatBubbleLeftRightIcon,
  PlusIcon,
  ChartBarIcon,
  StarIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline'

interface Property {
  id: string
  title: string
  location: string
  pricePerNight: number
  propertyType: string
  isActive: boolean
  images: string[]
  amenities: string[]
  stats: {
    totalBookings: number
    totalEarnings: number
    averageRating: number
  }
}

interface HostStats {
  activeProperties: number
  totalBookings: number
  totalRevenue: number
  averageRating: number
}

export default function HostDashboard() {
  const { isConnected, address } = useWeb3()
  const [activeTab, setActiveTab] = useState('overview')
  const [properties, setProperties] = useState<Property[]>([])
  const [hostStats, setHostStats] = useState<HostStats>({
    activeProperties: 0,
    totalBookings: 0,
    totalRevenue: 0,
    averageRating: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load host data when wallet is connected
  useEffect(() => {
    if (isConnected && address) {
      loadHostData()
    }
  }, [isConnected, address])

  const loadHostData = async () => {
    if (!address) return
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/properties?ownerAddress=${address}`)
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to load properties')
      }
      
      setProperties(data.properties)
      
      // Calculate overall stats
      const stats = data.properties.reduce(
        (acc: HostStats, prop: Property) => ({
          activeProperties: acc.activeProperties + (prop.isActive ? 1 : 0),
          totalBookings: acc.totalBookings + prop.stats.totalBookings,
          totalRevenue: acc.totalRevenue + prop.stats.totalEarnings,
          averageRating: acc.averageRating + prop.stats.averageRating
        }),
        { activeProperties: 0, totalBookings: 0, totalRevenue: 0, averageRating: 0 }
      )
      
      // Calculate average rating across all properties
      const activeProps = data.properties.filter((p: Property) => p.isActive)
      if (activeProps.length > 0) {
        stats.averageRating = stats.averageRating / activeProps.length
      }
      
      setHostStats(stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error loading host data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <HomeIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Host Dashboard</h1>
            <p className="text-gray-600 mb-6">
              Connect your wallet to start hosting on BaseStay
            </p>
            <ConnectWalletButton />
            <div className="mt-6 pt-6 border-t">
              <Link 
                href="/"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                ← Back to Guest View
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const stats = [
    { 
      name: 'Active Properties', 
      value: loading ? '...' : hostStats.activeProperties.toString(), 
      icon: HomeIcon, 
      change: '+1', 
      changeType: 'positive' as const
    },
    { 
      name: 'Total Bookings', 
      value: loading ? '...' : hostStats.totalBookings.toString(), 
      icon: CalendarDaysIcon, 
      change: '+5', 
      changeType: 'positive' as const
    },
    { 
      name: 'Revenue (USDC)', 
      value: loading ? '...' : hostStats.totalRevenue.toFixed(0), 
      icon: CurrencyDollarIcon, 
      change: '+12%', 
      changeType: 'positive' as const
    },
    { 
      name: 'Avg Rating', 
      value: loading ? '...' : hostStats.averageRating.toFixed(1), 
      icon: StarIcon, 
      change: '+0.2', 
      changeType: 'positive' as const
    }
  ]

  const recentBookings = [
    { id: 1, guest: '0x1234...5678', property: 'Luxury Villa', dates: 'Aug 25-28', amount: '350 USDC', status: 'confirmed' },
    { id: 2, guest: '0x8765...4321', property: 'Beach House', dates: 'Sep 1-5', amount: '800 USDC', status: 'pending' },
    { id: 3, guest: '0x9876...1234', property: 'City Apartment', dates: 'Sep 10-12', amount: '240 USDC', status: 'confirmed' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <HomeIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Host Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium px-3 py-2 rounded-md transition"
              >
                Guest View
              </Link>
              <span className="text-sm text-gray-600">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <ConnectWalletButton />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'properties', name: 'Properties', icon: HomeIcon },
              { id: 'bookings', name: 'Bookings', icon: CalendarDaysIcon },
              { id: 'messages', name: 'Messages', icon: ChatBubbleLeftRightIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {stats.map((stat) => (
                <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <stat.icon className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            {stat.name}
                          </dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">
                              {stat.value}
                            </div>
                            <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                              stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {stat.change}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Link
                href="/host/properties/new"
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <PlusIcon className="h-8 w-8 text-blue-600 group-hover:text-blue-700" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">Add Property</h3>
                    <p className="text-sm text-gray-500">List a new property for rent</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/host/bookings"
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CalendarDaysIcon className="h-8 w-8 text-green-600 group-hover:text-green-700" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-green-600">Manage Bookings</h3>
                    <p className="text-sm text-gray-500">View and approve reservations</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/host/analytics"
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-8 w-8 text-purple-600 group-hover:text-purple-700" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-purple-600">View Analytics</h3>
                    <p className="text-sm text-gray-500">Track your performance</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Bookings</h3>
              </div>
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Guest
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Property
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dates
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {booking.guest}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {booking.property}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.dates}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {booking.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            booking.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'properties' && (
          <div className="space-y-6">
            {/* Add New Property Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Your Properties</h2>
              <Link
                href="/host/properties/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Property
              </Link>
            </div>

            {/* Properties Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading properties...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-600">
                <p>Error: {error}</p>
                <button 
                  onClick={loadHostData}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-12">
                <HomeIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No properties yet</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by listing your first property</p>
                <Link
                  href="/host/add-property"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Property
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {properties.map((property) => (
                  <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <HomeIcon className="h-16 w-16 text-white" />
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {property.title}
                        </h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          property.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {property.isActive ? 'active' : 'inactive'}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">{property.location}</p>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-2xl font-bold text-blue-600">
                          ${property.pricePerNight} USDC/night
                        </span>
                        <div className="flex items-center">
                          <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm text-gray-600">{property.stats.averageRating.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-3">
                          <span>Bookings: {property.stats.totalBookings}</span>
                          <span>Earned: ${property.stats.totalEarnings}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Link
                            href={`/host/properties/${property.id}`}
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View
                          </Link>
                          <Link
                            href={`/host/properties/${property.id}/edit`}
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                          >
                            <PencilIcon className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">All Bookings</h2>
            </div>
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guest
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check-in
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check-out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.guest}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.property}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.dates.split('-')[0]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.dates.split('-')[1]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {booking.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          booking.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No messages</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Guest messages will appear here.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
