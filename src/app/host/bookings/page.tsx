'use client'

import { useState, useEffect } from 'react'
import { useWeb3 } from '@/components/web3/Web3Provider'
import Link from 'next/link'
import { 
  ArrowLeftIcon,
  CalendarDaysIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftIcon,
  EyeIcon
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
  status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'refunded'
  createdAt: string
  messages: number
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800', 
  'checked-in': 'bg-blue-100 text-blue-800',
  'checked-out': 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800'
}

const paymentStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  refunded: 'bg-red-100 text-red-800'
}

export default function HostBookings() {
  const { isConnected, address } = useWeb3()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all')

  useEffect(() => {
    if (isConnected) {
      loadBookings()
    }
  }, [isConnected])

  const loadBookings = async () => {
    try {
      // TODO: Load real bookings from smart contracts and database
      // Mock data for now
      const mockBookings: Booking[] = [
        {
          id: '1',
          propertyId: '1',
          propertyName: 'Cozy Downtown Apartment',
          guestAddress: '0x1234567890123456789012345678901234567890',
          guestName: 'Alice Johnson',
          checkIn: '2025-08-25',
          checkOut: '2025-08-28',
          guests: 2,
          totalAmount: 350,
          currency: 'USDC',
          status: 'confirmed',
          paymentStatus: 'paid',
          createdAt: '2025-08-20',
          messages: 2
        },
        {
          id: '2',
          propertyId: '2', 
          propertyName: 'Beach House Retreat',
          guestAddress: '0x9876543210987654321098765432109876543210',
          checkIn: '2025-09-01',
          checkOut: '2025-09-05',
          guests: 4,
          totalAmount: 1400,
          currency: 'USDC',
          status: 'pending',
          paymentStatus: 'pending',
          createdAt: '2025-08-21',
          messages: 1
        },
        {
          id: '3',
          propertyId: '3',
          propertyName: 'Mountain Cabin',
          guestAddress: '0x5555666677778888999900001111222233334444',
          guestName: 'Bob Smith',
          checkIn: '2025-09-10',
          checkOut: '2025-09-12',
          guests: 3,
          totalAmount: 400,
          currency: 'USDC',
          status: 'confirmed',
          paymentStatus: 'paid',
          createdAt: '2025-08-19',
          messages: 0
        }
      ]
      
      setBookings(mockBookings)
    } catch (error) {
      console.error('Error loading bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookingAction = async (bookingId: string, action: 'approve' | 'decline' | 'checkin' | 'checkout') => {
    try {
      // TODO: Implement actual blockchain transactions
      console.log(`${action} booking ${bookingId}`)
      
      setBookings(prev => prev.map(booking => {
        if (booking.id === bookingId) {
          switch (action) {
            case 'approve':
              return { ...booking, status: 'confirmed', paymentStatus: 'paid' }
            case 'decline':
              return { ...booking, status: 'cancelled', paymentStatus: 'refunded' }
            case 'checkin':
              return { ...booking, status: 'checked-in' }
            case 'checkout':
              return { ...booking, status: 'checked-out' }
            default:
              return booking
          }
        }
        return booking
      }))
      
    } catch (error) {
      console.error(`Error ${action} booking:`, error)
    }
  }

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true
    if (filter === 'pending') return booking.status === 'pending'
    if (filter === 'confirmed') return booking.status === 'confirmed'
    if (filter === 'completed') return ['checked-out', 'cancelled'].includes(booking.status)
    return true
  })

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-8">Please connect your wallet to view bookings</p>
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
              <CalendarDaysIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Bookings Management</h1>
            </div>
            <span className="text-sm text-gray-600">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'all', name: 'All Bookings', count: bookings.length },
              { id: 'pending', name: 'Pending', count: bookings.filter(b => b.status === 'pending').length },
              { id: 'confirmed', name: 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length },
              { id: 'completed', name: 'Completed', count: bookings.filter(b => ['checked-out', 'cancelled'].includes(b.status)).length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled')}
                className={`${
                  filter === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
              >
                {tab.name} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Bookings List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading bookings...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-8 text-center">
              <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guest & Property
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center">
                            <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <div className="text-sm font-medium text-gray-900">
                              {booking.guestName || `${booking.guestAddress.slice(0, 6)}...${booking.guestAddress.slice(-4)}`}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {booking.propertyName} • {booking.guests} guests
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {Math.ceil((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24))} nights
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${booking.totalAmount} {booking.currency}
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${paymentStatusColors[booking.paymentStatus]}`}>
                          {booking.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[booking.status]}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleBookingAction(booking.id, 'approve')}
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircleIcon className="h-3 w-3 mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleBookingAction(booking.id, 'decline')}
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                            >
                              <XCircleIcon className="h-3 w-3 mr-1" />
                              Decline
                            </button>
                          </>
                        )}

                        {booking.status === 'confirmed' && new Date(booking.checkIn) <= new Date() && (
                          <button
                            onClick={() => handleBookingAction(booking.id, 'checkin')}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                          >
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Check In
                          </button>
                        )}

                        {booking.status === 'checked-in' && (
                          <button
                            onClick={() => handleBookingAction(booking.id, 'checkout')}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-purple-600 hover:bg-purple-700"
                          >
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Check Out
                          </button>
                        )}

                        <button className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                          <EyeIcon className="h-3 w-3 mr-1" />
                          View
                        </button>

                        {booking.messages > 0 && (
                          <button className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                            <ChatBubbleLeftIcon className="h-3 w-3 mr-1" />
                            {booking.messages}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
