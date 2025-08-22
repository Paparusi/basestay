'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Upload, X, Coins, AlertCircle } from 'lucide-react'
import { usePropertyListing } from '@/hooks/usePropertyListing'

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
  'Wheelchair Accessible',
  'Balcony',
  'Garden',
  'Fireplace',
  'Elevator'
]

interface PropertyFormProps {
  onSubmit?: (result: any) => void
  onCancel?: () => void
}

export default function PropertyListingForm({ onSubmit, onCancel }: PropertyFormProps) {
  const { address, isConnected } = useAccount()
  const { listProperty, isSubmitting, error, canListProperties, balance, needsApproval } = usePropertyListing()
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    pricePerNight: 50,
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    propertyType: 'Apartment',
    amenities: [] as string[],
    images: [] as File[],
    checkInTime: '15:00',
    checkOutTime: '11:00',
    bstStakeAmount: 1000
  })

  const [currentStep, setCurrentStep] = useState(1)
  const [imageUrls, setImageUrls] = useState<string[]>([])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const newImages = files.slice(0, 10 - formData.images.length)
    const newUrls = newImages.map(file => URL.createObjectURL(file))

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }))
    
    setImageUrls(prev => [...prev, ...newUrls])
  }

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imageUrls[index])
    
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
    
    setImageUrls(prev => prev.filter((_, i) => i !== index))
  }

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.description && formData.location
      case 2:
        return formData.pricePerNight > 0 && formData.maxGuests > 0 && formData.propertyType
      case 3:
        return formData.images.length > 0
      case 4:
        return formData.bstStakeAmount >= 1000
      default:
        return false
    }
  }

  const handleSubmit = async () => {
    if (!isConnected || !canListProperties) return

    try {
      // Convert File objects to data URLs for now (in production, use IPFS)
      const imageUrls = await Promise.all(
        formData.images.map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.readAsDataURL(file)
          })
        })
      )

      const propertyData = {
        ...formData,
        images: imageUrls
      }

      const result = await listProperty(propertyData)
      
      if (result.success && onSubmit) {
        onSubmit(result)
      }
    } catch (error) {
      console.error('Failed to list property:', error)
    }
  }

  if (!isConnected) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Wallet Required</h3>
          <p className="text-gray-600 mb-4">
            You need to connect your wallet to list properties on BaseStay
          </p>
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Connect Wallet
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">List Your Property</h1>
        <p className="mt-2 text-gray-600">
          Share your space with travelers and earn BST rewards
        </p>
        <div className="mt-4 flex items-center justify-center space-x-2">
          <Coins className="h-5 w-5 text-blue-600" />
          <span className="text-sm text-gray-600">
            Balance: <strong>{balance} BST</strong>
          </span>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              currentStep >= step
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {step}
          </div>
        ))}
      </div>

      {/* BST Requirement Alert */}
      {!canListProperties && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
            <p className="text-sm text-yellow-700">
              You need to stake at least 1,000 BST tokens to list properties. 
              Current balance: {balance} BST
            </p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Step 1: Basic Information */}
      {currentStep === 1 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          <p className="text-gray-600 mb-6">Tell us about your property</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Cozy Downtown Apartment"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                placeholder="Describe your property, highlight unique features..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('location', e.target.value)}
                placeholder="e.g., San Francisco, CA"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Property Details */}
      {currentStep === 2 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Details</h2>
          <p className="text-gray-600 mb-6">Specify the details of your property</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type *
              </label>
              <select
                value={formData.propertyType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('propertyType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PROPERTY_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Night (USDC) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.pricePerNight}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('pricePerNight', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Guests *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxGuests}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('maxGuests', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.bedrooms}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('bedrooms', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.bathrooms}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('bathrooms', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {AMENITIES.map(amenity => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={amenity}
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={amenity} className="text-sm text-gray-700">{amenity}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Photos */}
      {currentStep === 3 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Photos</h2>
          <p className="text-gray-600 mb-6">Upload photos to showcase your property</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Photos (Max 10) *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('images')?.click()}
                    disabled={formData.images.length >= 10}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                  >
                    Select Photos
                  </button>
                </div>
              </div>
            </div>

            {imageUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Property ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 4: BST Staking */}
      {currentStep === 4 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">BST Staking</h2>
          <p className="text-gray-600 mb-6">
            Stake BST tokens to list your property and earn rewards
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                BST Stake Amount *
              </label>
              <input
                type="number"
                min="1000"
                step="100"
                value={formData.bstStakeAmount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('bstStakeAmount', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Minimum: 1,000 BST • Your balance: {balance} BST
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Coins className="h-5 w-5 text-blue-600 mr-2" />
                <p className="text-sm text-blue-700">
                  Staking more BST increases your property&apos;s visibility and earns you higher rewards!
                </p>
              </div>
            </div>

            {needsApproval && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
                  <p className="text-sm text-yellow-700">
                    You will need to approve BST spending before listing your property.
                  </p>
                </div>
              </div>
            )}

            {/* Check-in/Check-out times */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in Time
                </label>
                <input
                  type="time"
                  value={formData.checkInTime}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('checkInTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-out Time
                </label>
                <input
                  type="time"
                  value={formData.checkOutTime}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('checkOutTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onCancel?.()}
          disabled={isSubmitting}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          {currentStep > 1 ? 'Previous' : 'Cancel'}
        </button>

        {currentStep < 4 ? (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!validateStep()}
            className={`px-6 py-2 rounded-lg font-medium ${
              validateStep()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!validateStep() || !canListProperties || isSubmitting}
            className={`px-6 py-2 rounded-lg font-medium min-w-[120px] ${
              validateStep() && canListProperties && !isSubmitting
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Listing...' : 'List Property'}
          </button>
        )}
      </div>
    </div>
  )
}
