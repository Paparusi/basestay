'use client'

import { useState, useEffect, memo } from 'react'
import { useAccount } from 'wagmi'
import { 
  CalendarIcon,
  MapPinIcon,
  UserIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import Image from 'next/image'

interface Booking {
  id: string
  propertyId: string
  propertyTitle: string
  propertyImage?: string
  guestAddress: string
  guestName?: string
  checkIn: string
  checkOut: string
  totalPrice: number
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'
  guests: number
  createdAt: string
  notes?: string
}

const BookingCard = memo(({ booking }: { booking: Booking }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleIcon className="h-4 w-4" />
      case 'pending':
        return <ClockIcon className="h-4 w-4" />
      case 'active':
        return <CheckCircleIcon className="h-4 w-4" />
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4" />
      case 'cancelled':
        return <XCircleIcon className="h-4 w-4" />
      default:
        return <ExclamationTriangleIcon className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getDuration = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-medium text-gray-900 line-clamp-1">
                {booking.propertyTitle}
              </h3>
              <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                {getStatusIcon(booking.status)}
                <span className="ml-1 capitalize">{booking.status}</span>
              </span>
            </div>
            
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <UserIcon className="h-4 w-4 mr-1" />
              <span>{booking.guestName || `${booking.guestAddress.slice(0, 6)}...${booking.guestAddress.slice(-4)}`}</span>
              <span className="mx-2">•</span>
              <span>{booking.guests} guest{booking.guests > 1 ? 's' : ''}</span>
            </div>
          </div>
          
          {booking.propertyImage && (
            <div className="relative w-16 h-16 rounded-lg overflow-hidden ml-4">
              <Image
                src={booking.propertyImage}
                alt={booking.propertyTitle}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center text-sm">
            <CalendarIcon className="h-4 w-4 text-blue-600 mr-2" />
            <div>
              <div className="font-medium">Check-in</div>
              <div className="text-gray-500">{formatDate(booking.checkIn)}</div>
            </div>
          </div>
          
          <div className="flex items-center text-sm">
            <CalendarIcon className="h-4 w-4 text-purple-600 mr-2" />
            <div>
              <div className="font-medium">Check-out</div>
              <div className="text-gray-500">{formatDate(booking.checkOut)}</div>
            </div>
          </div>
          
          <div className="flex items-center text-sm">
            <CurrencyDollarIcon className="h-4 w-4 text-green-600 mr-2" />
            <div>
              <div className="font-medium">${booking.totalPrice.toLocaleString()}</div>
              <div className="text-gray-500">{getDuration(booking.checkIn, booking.checkOut)} nights</div>
            </div>
          </div>
        </div>

        {booking.notes && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-700">{booking.notes}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <span className="text-xs text-gray-500">
            Booked {formatDate(booking.createdAt)}
          </span>
          
          <div className="flex space-x-2">
            {booking.status === 'pending' && (
              <>
                <button className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors">
                  Decline
                </button>
                <button className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200 transition-colors">
                  Accept
                </button>
              </>
            )}
            
            <button className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200 transition-colors">
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})

BookingCard.displayName = 'BookingCard'

const BookingSkeleton = () => (
  <div className="bg-white rounded-lg shadow border border-gray-200 animate-pulse">
    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
        </div>
        <div className="w-16 h-16 bg-gray-200 rounded-lg ml-4"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center">
            <div className="h-4 w-4 bg-gray-200 rounded mr-2"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="h-3 bg-gray-200 rounded w-24"></div>
        <div className="flex space-x-2">
          <div className="h-6 w-16 bg-gray-200 rounded"></div>
          <div className="h-6 w-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  </div>
)

export default function BookingsTab() {
  const { address, isConnected } = useAccount()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'>('all')

  useEffect(() => {
    const loadBookings = async () => {
      if (!isConnected || !address) return

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/host/bookings?host=${address}`)
        
        if (!response.ok) {
          throw new Error('Failed to load bookings')
        }

        const data = await response.json()
        setBookings(data.bookings || [])
      } catch (error) {
        console.error('Error loading bookings:', error)
        setError('Failed to load bookings')
        
        // Mock data for development
        setBookings([
          {
            id: '1',
            propertyId: '1',
            propertyTitle: 'Modern Downtown Apartment',
            propertyImage: '/images/property1.jpg',
            guestAddress: '0x1234567890123456789012345678901234567890',
            guestName: 'John Smith',
            checkIn: '2024-03-15',
            checkOut: '2024-03-18',
            totalPrice: 360,
            status: 'confirmed',
            guests: 2,
            createdAt: '2024-03-01',
            notes: 'Looking forward to staying in your beautiful apartment!'
          },
          {
            id: '2',
            propertyId: '2',
            propertyTitle: 'Cozy Beach House',
            propertyImage: '/images/property2.jpg',
            guestAddress: '0x9876543210987654321098765432109876543210',
            guestName: 'Sarah Johnson',
            checkIn: '2024-03-20',
            checkOut: '2024-03-25',
            totalPrice: 1000,
            status: 'pending',
            guests: 4,
            createdAt: '2024-03-10',
            notes: 'Celebrating our anniversary, hoping for a peaceful stay by the ocean.'
          },
          {
            id: '3',
            propertyId: '1',
            propertyTitle: 'Modern Downtown Apartment',
            guestAddress: '0x5555666677778888999900001111222233334444',
            checkIn: '2024-02-10',
            checkOut: '2024-02-12',
            totalPrice: 240,
            status: 'completed',
            guests: 1,
            createdAt: '2024-02-05'
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    loadBookings()
  }, [isConnected, address])

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === filter)

  const getFilterCount = (status: string) => {
    return status === 'all' 
      ? bookings.length 
      : bookings.filter(booking => booking.status === status).length
  }

  const filters = [
    { key: 'all', label: 'All', count: getFilterCount('all') },
    { key: 'pending', label: 'Pending', count: getFilterCount('pending') },
    { key: 'confirmed', label: 'Confirmed', count: getFilterCount('confirmed') },
    { key: 'active', label: 'Active', count: getFilterCount('active') },
    { key: 'completed', label: 'Completed', count: getFilterCount('completed') },
    { key: 'cancelled', label: 'Cancelled', count: getFilterCount('cancelled') }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        
        <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
        
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <BookingSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Bookings</h2>
          <p className="text-gray-600 mt-1">
            Manage your {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {filters.map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key as any)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                filter === filterOption.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {filterOption.label}
              {filterOption.count > 0 && (
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  filter === filterOption.key
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {filterOption.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <CalendarIcon />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all' 
              ? 'Bookings will appear here when guests book your properties.'
              : `No bookings with ${filter} status found.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  )
}
