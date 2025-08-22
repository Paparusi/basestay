'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Calendar, Users, CreditCard, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { useBookingSystem } from '@/hooks/useBookingSystem'

interface Property {
  id: number
  title: string
  pricePerNight: number
  maxGuests: number
  images?: string[]
  location: string
  host: {
    name: string
    avatar?: string
  }
}

interface BookingFormProps {
  property: Property
  onBookingComplete?: (booking: any) => void
  onCancel?: () => void
}

export default function BookingForm({ property, onBookingComplete, onCancel }: BookingFormProps) {
  const { address, isConnected } = useAccount()
  const { 
    createBooking, 
    calculateBookingCost, 
    isBooking, 
    error, 
    usdcBalance, 
    needsApproval 
  } = useBookingSystem()

  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1
  })

  const [showCostBreakdown, setShowCostBreakdown] = useState(false)

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Calculate cost when dates/guests change
  const getCostBreakdown = () => {
    if (!formData.checkIn || !formData.checkOut) return null

    const checkIn = new Date(formData.checkIn)
    const checkOut = new Date(formData.checkOut)
    
    if (checkOut <= checkIn) return null

    return calculateBookingCost({
      propertyId: property.id,
      checkIn,
      checkOut,
      guests: formData.guests,
      pricePerNight: property.pricePerNight
    })
  }

  const costBreakdown = getCostBreakdown()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }

    if (!costBreakdown) {
      alert('Please select valid dates')
      return
    }

    try {
      const result = await createBooking({
        propertyId: property.id,
        checkIn: new Date(formData.checkIn),
        checkOut: new Date(formData.checkOut),
        guests: formData.guests,
        pricePerNight: property.pricePerNight
      })

      if (result.success && onBookingComplete) {
        onBookingComplete(result)
      }
    } catch (error) {
      console.error('Booking failed:', error)
    }
  }

  const isFormValid = () => {
    return formData.checkIn && 
           formData.checkOut && 
           formData.guests > 0 && 
           formData.guests <= property.maxGuests &&
           new Date(formData.checkOut) > new Date(formData.checkIn)
  }

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Wallet Required</h3>
          <p className="text-gray-600 mb-4">
            You need to connect your wallet to make a booking
          </p>
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Connect Wallet
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Property Header */}
      <div className="relative h-48">
        {property.images && property.images[0] ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
            <div className="text-blue-400 text-lg">🏠 Property Image</div>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h3 className="text-white font-semibold text-lg">{property.title}</h3>
          <p className="text-white/90 text-sm">{property.location}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* USDC Balance */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">Your USDC Balance:</span>
            <span className="font-semibold text-blue-900">{usdcBalance} USDC</span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Check-in Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="h-4 w-4 inline mr-1" />
            Check-in Date
          </label>
          <input
            type="date"
            min={minDate}
            value={formData.checkIn}
            onChange={(e) => handleInputChange('checkIn', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Check-out Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="h-4 w-4 inline mr-1" />
            Check-out Date
          </label>
          <input
            type="date"
            min={formData.checkIn || minDate}
            value={formData.checkOut}
            onChange={(e) => handleInputChange('checkOut', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Number of Guests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="h-4 w-4 inline mr-1" />
            Guests (Max {property.maxGuests})
          </label>
          <select
            value={formData.guests}
            onChange={(e) => handleInputChange('guests', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: property.maxGuests }, (_, i) => i + 1).map(num => (
              <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>

        {/* Cost Breakdown */}
        {costBreakdown && (
          <div className="border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={() => setShowCostBreakdown(!showCostBreakdown)}
              className="w-full flex items-center justify-between py-2 text-gray-700 hover:text-gray-900"
            >
              <span className="font-medium">Cost Breakdown</span>
              <span className="text-sm">
                {showCostBreakdown ? '▼' : '▶'}
              </span>
            </button>

            {showCostBreakdown && (
              <div className="space-y-2 mt-2 text-sm">
                <div className="flex justify-between">
                  <span>${property.pricePerNight} × {costBreakdown.nights} nights</span>
                  <span>${costBreakdown.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform fee (2.5%)</span>
                  <span>${costBreakdown.platformFee.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                  <span>Total (USDC)</span>
                  <span>${costBreakdown.total.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Balance Check */}
            {parseFloat(usdcBalance) < costBreakdown.total && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
                  <span className="text-sm text-red-700">
                    Insufficient USDC balance. Need {costBreakdown.total.toFixed(2)} USDC
                  </span>
                </div>
              </div>
            )}

            {/* Approval Notice */}
            {parseFloat(usdcBalance) >= costBreakdown.total && needsApproval(costBreakdown.total.toString()) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-yellow-400 mr-2" />
                  <span className="text-sm text-yellow-700">
                    You&apos;ll need to approve USDC spending before booking
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Host Info */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              {property.host.avatar ? (
                <img
                  src={property.host.avatar}
                  alt={property.host.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-gray-500 text-sm">👤</span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Hosted by {property.host.name}
              </p>
              <p className="text-xs text-gray-500">Superhost</p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="space-y-2">
          <button
            type="submit"
            disabled={!isFormValid() || isBooking || (costBreakdown ? parseFloat(usdcBalance) < costBreakdown.total : false)}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
              isFormValid() && !isBooking && (!costBreakdown || parseFloat(usdcBalance) >= costBreakdown.total)
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {isBooking ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <CreditCard className="h-4 w-4 mr-2" />
                {costBreakdown ? `Book for $${costBreakdown.total.toFixed(2)} USDC` : 'Book Now'}
              </span>
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Payment Info */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Payments are processed securely on Base blockchain with USDC
          </p>
          <div className="flex items-center justify-center mt-2 space-x-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span className="text-xs text-green-600">Secure • Instant • Decentralized</span>
          </div>
        </div>
      </form>
    </div>
  )
}
