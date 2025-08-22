'use client'

import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { 
  CurrencyDollarIcon,
  CalendarIcon,
  ChartBarIcon,
  StarIcon
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
  monthlyData: Array<{
    month: string
    revenue: number
    bookings: number
    occupancy: number
  }>
  topProperties: Array<{
    id: string
    name: string
    revenue: number
    bookings: number
  }>
  recentActivities: Array<{
    id: string
    type: string
    description: string
    timestamp: string
  }>
}

const StatCard = ({ title, value, change, icon: Icon, prefix = '', suffix = '' }: {
  title: string
  value: number
  change: number
  icon: React.ComponentType<{ className?: string }>
  prefix?: string
  suffix?: string
}) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <Icon className="h-6 w-6 text-gray-400" />
      </div>
      <div className="ml-5 w-0 flex-1">
        <dl>
          <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
          <dd className="text-lg font-medium text-gray-900">
            {prefix}{value.toLocaleString()}{suffix}
          </dd>
        </dl>
      </div>
    </div>
    <div className="mt-4">
      <div className={`flex items-center text-sm ${
        change >= 0 ? 'text-green-600' : 'text-red-600'
      }`}>
        <span>{change >= 0 ? '+' : ''}{change.toFixed(1)}%</span>
        <span className="ml-1 text-gray-500">vs last month</span>
      </div>
    </div>
  </div>
)

export default function AnalyticsPage() {
  const { address, isConnected } = useAccount()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!isConnected || !address) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/analytics?owner=${address}`)
        
        if (response.ok) {
          const data = await response.json()
          setAnalytics(data)
        } else {
          setAnalytics({
            revenue: { total: 0, thisMonth: 0, lastMonth: 0, change: 0 },
            bookings: { total: 0, thisMonth: 0, lastMonth: 0, change: 0 },
            occupancyRate: { current: 0, change: 0 },
            averageRating: { current: 0, change: 0 },
            monthlyData: [],
            topProperties: [],
            recentActivities: []
          })
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
        setError('Failed to load analytics')
        setAnalytics(null)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [address, isConnected])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-900 mb-4">Connect Your Wallet</div>
          <p className="text-gray-600">Please connect your wallet to view analytics.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl font-semibold mb-4">Error Loading Analytics</div>
          <p className="text-gray-600">{error || 'Failed to load analytics data'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your property performance and earnings</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={analytics.revenue.total}
            change={analytics.revenue.change}
            icon={CurrencyDollarIcon}
            prefix="$"
          />
          <StatCard
            title="Total Bookings"
            value={analytics.bookings.total}
            change={analytics.bookings.change}
            icon={CalendarIcon}
          />
          <StatCard
            title="Occupancy Rate"
            value={analytics.occupancyRate.current}
            change={analytics.occupancyRate.change}
            icon={ChartBarIcon}
            suffix="%"
          />
          <StatCard
            title="Average Rating"
            value={analytics.averageRating.current}
            change={analytics.averageRating.change}
            icon={StarIcon}
          />
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data Yet</h3>
          <p className="text-gray-600 mb-4">
            Your analytics data will appear here once you start receiving bookings and earnings.
          </p>
        </div>
      </div>
    </div>
  )
}
