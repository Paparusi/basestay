'use client'

import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { 
  CalendarIcon,
  UserIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline'

interface Booking {
  id: string
  propertyId: string
  propertyName: string
  guestAddress: string
  guestName?: string
  checkIn: string
  checkOut: string
  guests: number
  totalAmount: number
  currency: string
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'refunded'
  createdAt: string
  messages?: number
}

const BookingCard = ({ booking }: { booking: Booking }) => {
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
      case 'active':
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4" />
      case 'pending':
        return <ClockIcon className="h-4 w-4" />
      case 'cancelled':
        return <XCircleIcon className="h-4 w-4" />
      default:
        return <ClockIcon className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{booking.propertyName}</h3>
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
              {getStatusIcon(booking.status)}
              <span className="ml-1 capitalize">{booking.status}</span>
            </span>
            <span className="inline-flex items-center">
              <UserIcon className="h-4 w-4 mr-1" />
              {booking.guestName || `${booking.guestAddress.slice(0, 6)}...${booking.guestAddress.slice(-4)}`}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">
            {booking.totalAmount} {booking.currency}
          </div>
          <div className={`text-xs px-2 py-1 rounded ${
            booking.paymentStatus === 'paid' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {booking.paymentStatus}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <CalendarIcon className="h-4 w-4 mr-2" />
          <div>
            <div className="font-medium">Check-in</div>
            <div>{formatDate(booking.checkIn)}</div>
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <CalendarIcon className="h-4 w-4 mr-2" />
          <div>
            <div className="font-medium">Check-out</div>
            <div>{formatDate(booking.checkOut)}</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {booking.guests} guest{booking.guests > 1 ? 's' : ''}
        </div>
        <div className="flex space-x-2">
          {booking.messages && booking.messages > 0 && (
            <button className="flex items-center text-blue-600 hover:text-blue-800 text-sm">
              <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
              {booking.messages} message{booking.messages > 1 ? 's' : ''}
            </button>
          )}
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors">
            View Details
          </button>
        </div>
      </div>
    </div>
  )
}

const BookingSkeleton = () => (
  <div className="bg-white rounded-lg shadow border border-gray-200 p-6 animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="flex-1">
        <div className="h-5 bg-gray-200 rounded w-2/3 mb-2"></div>
        <div className="flex space-x-2">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
      <div className="text-right">
        <div className="h-5 bg-gray-200 rounded w-16 mb-1"></div>
        <div className="h-3 bg-gray-200 rounded w-12"></div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="h-10 bg-gray-200 rounded"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
    <div className="flex justify-between items-center">
      <div className="h-4 bg-gray-200 rounded w-16"></div>
      <div className="h-8 bg-gray-200 rounded w-24"></div>
    </div>
  </div>
)

export default function BookingsPage() {
  const { address, isConnected } = useAccount()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBookings = async () => {
      if (!isConnected || !address) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        // Fetch real bookings from API
        const response = await fetch(`/api/bookings?owner=${address}`)
        
        if (response.ok) {
          const data = await response.json()
          setBookings(data.bookings || [])
        } else {
          setBookings([])
        }
      } catch (error) {
        console.error('Error fetching bookings:', error)
        setError('Failed to load bookings')
        setBookings([])
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [address, isConnected])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-900 mb-4">Connect Your Wallet</div>
          <p className="text-gray-600">Please connect your wallet to view your bookings.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8 animate-pulse"></div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <BookingSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl font-semibold mb-4">Error Loading Bookings</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Bookings</h1>
          <p className="text-gray-600">Manage your property reservations</p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-600 mb-4">
              Your property bookings will appear here once guests start making reservations.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-sm text-gray-600 mb-4">
              {bookings.length} booking{bookings.length > 1 ? 's' : ''} found
            </div>
            {bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
