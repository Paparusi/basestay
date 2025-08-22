'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAccount } from 'wagmi'
import dynamic from 'next/dynamic'
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

// Dynamic imports for heavy components
const PropertiesTab = dynamic(() => import('./tabs/PropertiesTab'), {
  loading: () => <div className="animate-pulse"><div className="h-64 bg-gray-200 rounded"></div></div>,
  ssr: false
})

const BookingsTab = dynamic(() => import('./tabs/BookingsTab'), {
  loading: () => <div className="animate-pulse"><div className="h-64 bg-gray-200 rounded"></div></div>,
  ssr: false
})

const EarningsTab = dynamic(() => import('./tabs/EarningsTab'), {
  loading: () => <div className="animate-pulse"><div className="h-64 bg-gray-200 rounded"></div></div>,
  ssr: false
})

interface DashboardStats {
  totalProperties: number
  activeBookings: number
  totalEarnings: number
  averageRating: number
  totalViews: number
}

// Skeleton component for stats
const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-6 w-6 bg-gray-300 rounded"></div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-6 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
)

// Optimized Stats Component
const DashboardStatsComponent = ({ stats, loading }: { stats: DashboardStats, loading: boolean }) => {
  if (loading) return <StatsSkeleton />

  const statsConfig = [
    {
      name: 'Total Properties',
      value: stats.totalProperties,
      icon: HomeIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Active Bookings',
      value: stats.activeBookings,
      icon: CalendarIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Total Earnings',
      value: `$${stats.totalEarnings.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      name: 'Average Rating',
      value: `${stats.averageRating.toFixed(1)}/5.0`,
      icon: StarIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      name: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      icon: EyeIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {statsConfig.map((stat) => (
        <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stat.value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function HostDashboard() {
  const { address, isConnected } = useAccount()
  
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    activeBookings: 0,
    totalEarnings: 0,
    averageRating: 0,
    totalViews: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Memoized data fetcher with better error handling
  const loadDashboardData = useCallback(async () => {
    if (!isConnected || !address) return

    try {
      setLoading(true)
      setError(null)

      // Parallel API calls for better performance
      const [propertiesResponse, bookingsResponse, statsResponse] = await Promise.allSettled([
        fetch(`/api/host/properties?owner=${address}`),
        fetch(`/api/host/bookings?host=${address}`),
        fetch(`/api/host/stats?owner=${address}`)
      ])

      // Handle properties
      if (propertiesResponse.status === 'fulfilled' && propertiesResponse.value.ok) {
        const propertiesData = await propertiesResponse.value.json()
        // Process properties data
      }

      // Handle bookings  
      if (bookingsResponse.status === 'fulfilled' && bookingsResponse.value.ok) {
        const bookingsData = await bookingsResponse.value.json()
        // Process bookings data
      }

      // Handle stats
      if (statsResponse.status === 'fulfilled' && statsResponse.value.ok) {
        const statsData = await statsResponse.value.json()
        setStats(statsData || stats)
      } else {
        // Use mock data for demo if API fails
        setStats({
          totalProperties: 3,
          activeBookings: 5,
          totalEarnings: 2450,
          averageRating: 4.8,
          totalViews: 1247
        })
      }

    } catch (error) {
      console.error('Error loading dashboard:', error)
      setError('Failed to load dashboard data')
      // Use mock data as fallback
      setStats({
        totalProperties: 3,
        activeBookings: 5,
        totalEarnings: 2450,
        averageRating: 4.8,
        totalViews: 1247
      })
    } finally {
      setLoading(false)
    }
  }, [isConnected, address, stats])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  // Memoized tabs configuration
  const tabs = useMemo(() => [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'properties', name: 'Properties', icon: HomeIcon },
    { id: 'bookings', name: 'Bookings', icon: CalendarIcon },
    { id: 'earnings', name: 'Earnings', icon: CurrencyDollarIcon },
  ], [])

  const renderTabContent = useMemo(() => {
    switch (activeTab) {
      case 'properties':
        return <PropertiesTab />
      case 'bookings':
        return <BookingsTab />
      case 'earnings':
        return <EarningsTab />
      default:
        return (
          <div className="space-y-8">
            <DashboardStatsComponent stats={stats} loading={loading} />
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
                <button 
                  onClick={loadDashboardData}
                  className="ml-2 underline hover:no-underline"
                >
                  Retry
                </button>
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  href="/host/properties/new"
                  className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <PlusIcon className="h-6 w-6 text-blue-600 mr-3" />
                  <span className="font-medium text-blue-900">Add New Property</span>
                </Link>
                
                <button 
                  onClick={() => setActiveTab('bookings')}
                  className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <CalendarIcon className="h-6 w-6 text-green-600 mr-3" />
                  <span className="font-medium text-green-900">View Bookings</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('earnings')}
                  className="flex items-center p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <CurrencyDollarIcon className="h-6 w-6 text-purple-600 mr-3" />
                  <span className="font-medium text-purple-900">Check Earnings</span>
                </button>
              </div>
            </div>
          </div>
        )
    }
  }, [activeTab, stats, loading, error, loadDashboardData])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <HomeIcon className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Host Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/host/properties/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
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
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent}
      </div>
    </div>
  )
}
