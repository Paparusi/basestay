'use client'

import { useState, useEffect, memo } from 'react'
import { useAccount } from 'wagmi'
import { 
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  HomeIcon,
  ChartBarIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'

interface EarningsData {
  totalEarnings: number
  thisMonthEarnings: number
  lastMonthEarnings: number
  pendingPayouts: number
  completedBookings: number
  averageNightlyRate: number
  occupancyRate: number
  monthlyData: {
    month: string
    earnings: number
    bookings: number
  }[]
  recentTransactions: {
    id: string
    propertyTitle: string
    amount: number
    date: string
    type: 'earning' | 'payout' | 'fee'
    status: 'completed' | 'pending'
  }[]
}

const StatCard = memo(({ title, value, change, icon: Icon, positive }: {
  title: string
  value: string
  change?: string
  icon: any
  positive?: boolean
}) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {value}
              </div>
              {change && (
                <div className={`ml-2 flex items-center text-sm font-medium ${
                  positive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {positive ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                  )}
                  {change}
                </div>
              )}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
))

StatCard.displayName = 'StatCard'

const TransactionRow = memo(({ transaction }: { transaction: EarningsData['recentTransactions'][0] }) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0">
    <div className="flex-1">
      <div className="flex items-center">
        <div className={`w-2 h-2 rounded-full mr-3 ${
          transaction.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
        }`} />
        <div>
          <p className="text-sm font-medium text-gray-900 line-clamp-1">
            {transaction.propertyTitle}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(transaction.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
      </div>
    </div>
    
    <div className="flex items-center space-x-4">
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
        transaction.type === 'earning'
          ? 'bg-green-100 text-green-800'
          : transaction.type === 'payout'
          ? 'bg-blue-100 text-blue-800'
          : 'bg-gray-100 text-gray-800'
      }`}>
        {transaction.type}
      </span>
      
      <span className={`text-sm font-medium ${
        transaction.type === 'fee' ? 'text-red-600' : 'text-green-600'
      }`}>
        {transaction.type === 'fee' ? '-' : '+'}${transaction.amount.toLocaleString()}
      </span>
    </div>
  </div>
))

TransactionRow.displayName = 'TransactionRow'

const EarningsSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
          <div className="p-5">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="ml-5 w-0 flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="h-48 bg-gray-200 rounded"></div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

export default function EarningsTab() {
  const { address, isConnected } = useAccount()
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadEarnings = async () => {
      if (!isConnected || !address) return

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/host/earnings?owner=${address}`)
        
        if (!response.ok) {
          throw new Error('Failed to load earnings data')
        }

        const data = await response.json()
        setEarningsData(data)
      } catch (error) {
        console.error('Error loading earnings:', error)
        setError('Failed to load earnings data')
        
        // Mock data for development
        setEarningsData({
          totalEarnings: 4280,
          thisMonthEarnings: 950,
          lastMonthEarnings: 820,
          pendingPayouts: 180,
          completedBookings: 23,
          averageNightlyRate: 135,
          occupancyRate: 78,
          monthlyData: [
            { month: 'Jan', earnings: 680, bookings: 5 },
            { month: 'Feb', earnings: 820, bookings: 6 },
            { month: 'Mar', earnings: 950, bookings: 7 },
            { month: 'Apr', earnings: 1200, bookings: 9 },
            { month: 'May', earnings: 1430, bookings: 11 },
            { month: 'Jun', earnings: 1680, bookings: 12 }
          ],
          recentTransactions: [
            {
              id: '1',
              propertyTitle: 'Modern Downtown Apartment',
              amount: 360,
              date: '2024-03-18',
              type: 'earning',
              status: 'completed'
            },
            {
              id: '2',
              propertyTitle: 'Cozy Beach House',
              amount: 200,
              date: '2024-03-17',
              type: 'payout',
              status: 'pending'
            },
            {
              id: '3',
              propertyTitle: 'Mountain Cabin Retreat',
              amount: 18,
              date: '2024-03-16',
              type: 'fee',
              status: 'completed'
            },
            {
              id: '4',
              propertyTitle: 'Modern Downtown Apartment',
              amount: 240,
              date: '2024-03-15',
              type: 'earning',
              status: 'completed'
            },
            {
              id: '5',
              propertyTitle: 'Cozy Beach House',
              amount: 600,
              date: '2024-03-14',
              type: 'earning',
              status: 'completed'
            }
          ]
        })
      } finally {
        setLoading(false)
      }
    }

    loadEarnings()
  }, [isConnected, address])

  if (loading) {
    return <EarningsSkeleton />
  }

  if (!earningsData) {
    return (
      <div className="text-center py-12">
        <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No earnings data</h3>
        <p className="mt-1 text-sm text-gray-500">Earnings data will appear here once you start receiving bookings.</p>
      </div>
    )
  }

  const monthlyChange = earningsData.thisMonthEarnings - earningsData.lastMonthEarnings
  const monthlyChangePercent = earningsData.lastMonthEarnings > 0 
    ? ((monthlyChange / earningsData.lastMonthEarnings) * 100).toFixed(1)
    : '0'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Earnings</h2>
          <p className="text-gray-600 mt-1">
            Track your income and payouts
          </p>
        </div>
        
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
          <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
          Export Data
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Earnings"
          value={`$${earningsData.totalEarnings.toLocaleString()}`}
          icon={CurrencyDollarIcon}
        />
        
        <StatCard
          title="This Month"
          value={`$${earningsData.thisMonthEarnings.toLocaleString()}`}
          change={`${monthlyChangePercent}%`}
          positive={monthlyChange >= 0}
          icon={ArrowTrendingUpIcon}
        />
        
        <StatCard
          title="Pending Payouts"
          value={`$${earningsData.pendingPayouts.toLocaleString()}`}
          icon={CalendarIcon}
        />
        
        <StatCard
          title="Avg. Nightly Rate"
          value={`$${earningsData.averageNightlyRate}`}
          icon={HomeIcon}
        />
      </div>

      {/* Charts and Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Earnings Chart Placeholder */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Monthly Earnings</h3>
            <ChartBarIcon className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {earningsData.monthlyData.map((data, index) => (
              <div key={data.month} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-900 w-8">
                    {data.month}
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-32">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ 
                        width: `${(data.earnings / Math.max(...earningsData.monthlyData.map(d => d.earnings))) * 100}%` 
                      }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    ${data.earnings.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {data.bookings} booking{data.bookings !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h3>
          
          <div className="space-y-1">
            {earningsData.recentTransactions.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} />
            ))}
          </div>
          
          {earningsData.recentTransactions.length === 0 && (
            <div className="text-center py-8">
              <CurrencyDollarIcon className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No transactions yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {earningsData.completedBookings}
            </div>
            <div className="text-sm text-gray-500">Completed Bookings</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {earningsData.occupancyRate}%
            </div>
            <div className="text-sm text-gray-500">Occupancy Rate</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              ${Math.round(earningsData.totalEarnings / earningsData.completedBookings || 0)}
            </div>
            <div className="text-sm text-gray-500">Avg. Booking Value</div>
          </div>
        </div>
      </div>
    </div>
  )
}
