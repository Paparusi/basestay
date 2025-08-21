'use client'

import { useState, useEffect } from 'react'
import { useWeb3 } from '@/components/web3/Web3Provider'
import Link from 'next/link'
import { 
  ArrowLeftIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  StarIcon,
  EyeIcon,
  HomeIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

interface Analytics {
  revenue: {
    total: number
    thisMonth: number
    lastMonth: number
    change: number
  }
  bookings: {
    total: number
    thisMonth: number
    lastMonth: number
    change: number
  }
  occupancyRate: {
    current: number
    change: number
  }
  averageRating: {
    current: number
    change: number
  }
  monthlyData: {
    month: string
    revenue: number
    bookings: number
    occupancy: number
  }[]
  propertyPerformance: {
    propertyId: string
    name: string
    revenue: number
    bookings: number
    rating: number
    occupancyRate: number
  }[]
  topMetrics: {
    bestMonth: string
    totalGuests: number
    averageStayLength: number
    repeatGuests: number
  }
}

export default function HostAnalytics() {
  const { isConnected, address } = useWeb3()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'3m' | '6m' | '1y'>('6m')

  useEffect(() => {
    if (isConnected) {
      loadAnalytics()
    }
  }, [isConnected, selectedPeriod])

  const loadAnalytics = async () => {
    try {
      // TODO: Load real analytics from smart contracts and database
      // Mock data for now
      const mockAnalytics: Analytics = {
        revenue: {
          total: 24500,
          thisMonth: 3200,
          lastMonth: 2800,
          change: 14.3
        },
        bookings: {
          total: 127,
          thisMonth: 18,
          lastMonth: 15,
          change: 20.0
        },
        occupancyRate: {
          current: 78,
          change: 5.2
        },
        averageRating: {
          current: 4.8,
          change: 0.1
        },
        monthlyData: [
          { month: 'Mar', revenue: 2100, bookings: 12, occupancy: 65 },
          { month: 'Apr', revenue: 2800, bookings: 16, occupancy: 72 },
          { month: 'May', revenue: 3200, bookings: 19, occupancy: 85 },
          { month: 'Jun', revenue: 3800, bookings: 22, occupancy: 88 },
          { month: 'Jul', revenue: 4200, bookings: 25, occupancy: 92 },
          { month: 'Aug', revenue: 3200, bookings: 18, occupancy: 78 }
        ],
        propertyPerformance: [
          {
            propertyId: '1',
            name: 'Cozy Downtown Apartment',
            revenue: 8500,
            bookings: 47,
            rating: 4.8,
            occupancyRate: 85
          },
          {
            propertyId: '2', 
            name: 'Beach House Retreat',
            revenue: 12000,
            bookings: 23,
            rating: 4.9,
            occupancyRate: 78
          },
          {
            propertyId: '3',
            name: 'Mountain Cabin',
            revenue: 4000,
            bookings: 15,
            rating: 4.7,
            occupancyRate: 65
          }
        ],
        topMetrics: {
          bestMonth: 'July 2025',
          totalGuests: 284,
          averageStayLength: 3.2,
          repeatGuests: 23
        }
      }

      setAnalytics(mockAnalytics)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-8">Please connect your wallet to view analytics</p>
          <Link 
            href="/host"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Go to Host Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (loading || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <ChartBarIcon className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
              </div>
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading analytics...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/host"
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Link>
              <ChartBarIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="3m">Last 3 Months</option>
                <option value="6m">Last 6 Months</option>
                <option value="1y">Last Year</option>
              </select>
              <span className="text-sm text-gray-600">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Revenue
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        ${analytics.revenue.total.toLocaleString()}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        analytics.revenue.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {analytics.revenue.change >= 0 ? (
                          <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />
                        )}
                        {Math.abs(analytics.revenue.change)}%
                      </div>
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
                  <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Bookings
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {analytics.bookings.total}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        analytics.bookings.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {analytics.bookings.change >= 0 ? (
                          <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />
                        )}
                        {Math.abs(analytics.bookings.change)}%
                      </div>
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
                  <HomeIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Occupancy Rate
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {analytics.occupancyRate.current}%
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        analytics.occupancyRate.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {analytics.occupancyRate.change >= 0 ? (
                          <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />
                        )}
                        {Math.abs(analytics.occupancyRate.change)}%
                      </div>
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
                  <StarIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Average Rating
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {analytics.averageRating.current}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        analytics.averageRating.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {analytics.averageRating.change >= 0 ? (
                          <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />
                        )}
                        +{Math.abs(analytics.averageRating.change)}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Revenue Chart */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Performance</h3>
            <div className="space-y-4">
              {analytics.monthlyData.map((data, index) => (
                <div key={data.month} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 text-sm font-medium text-gray-700">
                      {data.month}
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(data.revenue / 5000) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      ${data.revenue.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {data.bookings} bookings
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Insights */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Key Insights</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-green-800">Best Month</div>
                  <div className="text-lg font-semibold text-green-900">{analytics.topMetrics.bestMonth}</div>
                </div>
                <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-blue-800">Total Guests Hosted</div>
                  <div className="text-lg font-semibold text-blue-900">{analytics.topMetrics.totalGuests}</div>
                </div>
                <UserGroupIcon className="h-8 w-8 text-blue-600" />
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-purple-800">Average Stay</div>
                  <div className="text-lg font-semibold text-purple-900">{analytics.topMetrics.averageStayLength} nights</div>
                </div>
                <CalendarDaysIcon className="h-8 w-8 text-purple-600" />
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-yellow-800">Repeat Guests</div>
                  <div className="text-lg font-semibold text-yellow-900">{analytics.topMetrics.repeatGuests}</div>
                </div>
                <StarIcon className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Property Performance */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Property Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bookings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Occupancy
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.propertyPerformance.map((property) => (
                  <tr key={property.propertyId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {property.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${property.revenue.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {property.bookings}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <StarIcon className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm text-gray-900">{property.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {property.occupancyRate}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
