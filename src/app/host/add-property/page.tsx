'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWeb3 } from '@/components/web3/Web3Provider'
import Link from 'next/link'
import { 
  HomeIcon,
  ArrowLeftIcon,
  PhotoIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

interface PropertyFormData {
  title: string
  description: string
  location: string
  latitude?: number
  longitude?: number
  pricePerNight: number
  maxGuests: number
  bedrooms: number
  bathrooms: number
  propertyType: string
  amenities: string[]
  images: string[]
  rules: string
  checkInTime: string
  checkOutTime: string
}

const PROPERTY_TYPES = [
  'Apartment',
  'House',
  'Condo',
  'Villa',
  'Cabin',
  'Loft',
  'Studio',
  'Other'
]

const AMENITIES = [
  'WiFi',
  'Kitchen',
  'Parking',
  'Air Conditioning',
  'Heating',
  'TV',
  'Washer/Dryer',
  'Pool',
  'Hot Tub',
  'Gym',
  'Pet Friendly',
  'Smoking Allowed',
  'Wheelchair Accessible'
]

export default function AddPropertyPage() {
  const { address, isConnected } = useWeb3()
  const router = useRouter()
  
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    location: '',
    pricePerNight: 50, // Set default minimum price
    maxGuests: 1,
    bedrooms: 1,
    bathrooms: 1,
    propertyType: 'Apartment',
    amenities: [],
    images: [],
    rules: '',
    checkInTime: '15:00',
    checkOutTime: '11:00'
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)

  const handleInputChange = (field: keyof PropertyFormData, value: string | number | boolean | string[]) => {
    console.log(`📝 Input changed: ${field} = ${value}`)
    setFormData(prev => ({ ...prev, [field]: value }))
    console.log(`📝 Updated formData.${field}:`, value)
  }

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!address || !isConnected) {
      setError('Please connect your wallet first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const dataToSend = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        pricePerNight: formData.pricePerNight,
        maxGuests: formData.maxGuests,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        propertyType: formData.propertyType,
        amenities: formData.amenities,
        images: formData.images.length > 0 ? formData.images : [],
        owner: address
      }
      
      console.log('🚀 Form data before sending:', formData)
      console.log('🚀 Data being sent to API:', dataToSend)
      console.log('🚀 Fields check:', {
        title: !!formData.title,
        description: !!formData.description,
        location: !!formData.location,
        pricePerNight: !!formData.pricePerNight,
        maxGuests: !!formData.maxGuests,
        owner: !!address
      })
      
      const response = await fetch('/api/properties/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      })

      const data = await response.json()
      console.log('🔍 API Response:', data)

      if (!data.success) {
        throw new Error(data.error || 'Failed to create property')
      }

      // Success - redirect to host dashboard
      router.push('/host?success=property-created')
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <HomeIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Connect Wallet Required</h1>
          <p className="text-gray-600 mb-6">Please connect your wallet to add a property</p>
          <Link
            href="/host"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/host" className="mr-4">
                <ArrowLeftIcon className="h-6 w-6 text-gray-600 hover:text-gray-900" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Add New Property</h1>
            </div>
            <span className="text-sm text-gray-600">Step {currentStep} of 3</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Basic Information</h2>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Property Title</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Cozy Downtown Apartment"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    required
                    rows={4}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your property, highlight unique features and nearby attractions... (minimum 5 characters)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPinIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="City, State/Country"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Property Type</label>
                    <select
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={formData.propertyType}
                      onChange={(e) => handleInputChange('propertyType', e.target.value)}
                    >
                      {PROPERTY_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price per Night (USDC)</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        min="1"
                        required
                        className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        value={formData.pricePerNight}
                        onChange={(e) => handleInputChange('pricePerNight', Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Next: Property Details
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Property Details */}
          {currentStep === 2 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Property Details</h2>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Max Guests</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserGroupIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      min="1"
                      className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={formData.maxGuests}
                      onChange={(e) => handleInputChange('maxGuests', Number(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
                  <input
                    type="number"
                    min="1"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={formData.bedrooms}
                    onChange={(e) => handleInputChange('bedrooms', Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
                  <input
                    type="number"
                    min="1"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={formData.bathrooms}
                    onChange={(e) => handleInputChange('bathrooms', Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Amenities</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {AMENITIES.map(amenity => (
                    <label key={amenity} className="relative flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          type="checkbox"
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <span className="text-gray-700">{amenity}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Check-in Time</label>
                  <input
                    type="time"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={formData.checkInTime}
                    onChange={(e) => handleInputChange('checkInTime', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Check-out Time</label>
                  <input
                    type="time"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={formData.checkOutTime}
                    onChange={(e) => handleInputChange('checkOutTime', e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Next: Rules & Photos
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Rules and Photos */}
          {currentStep === 3 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Rules & Photos</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">House Rules</label>
                  <textarea
                    rows={4}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={formData.rules}
                    onChange={(e) => handleInputChange('rules', e.target.value)}
                    placeholder="e.g., No smoking, No pets, Quiet hours after 10 PM..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Property Photos</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <p className="text-sm text-gray-600">
                          Photo upload feature coming soon. For now, the property will be created with placeholder images.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="mt-6 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Property...' : 'Create Property'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
