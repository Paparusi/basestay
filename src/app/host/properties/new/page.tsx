'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { ConnectWallet } from '@coinbase/onchainkit/wallet'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { 
  HomeIcon,
  ArrowLeftIcon,
  PhotoIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  WifiIcon,
  TvIcon,
  FireIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

// Dynamic import for image upload component
const ImageUploadSection = dynamic(() => import('@/components/ImageUploadSection'), {
  loading: () => <div className="animate-pulse h-48 bg-gray-200 rounded-lg"></div>,
  ssr: false
})

interface PropertyForm {
  name: string
  description: string
  location: string
  pricePerNight: number
  maxGuests: number
  bedrooms: number
  bathrooms: number
  amenities: string[]
  images: File[]
}

// Memoized amenities list
const amenitiesList = [
  { id: 'wifi', name: 'WiFi', icon: WifiIcon },
  { id: 'tv', name: 'TV', icon: TvIcon },
  { id: 'kitchen', name: 'Kitchen', icon: FireIcon },
  { id: 'pool', name: 'Pool', icon: SparklesIcon },
  { id: 'parking', name: 'Free Parking', icon: HomeIcon },
  { id: 'ac', name: 'Air Conditioning', icon: HomeIcon }
]

// Step component with memo
const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) => (
  <div className="flex items-center mb-8">
    {[...Array(totalSteps)].map((_, index) => (
      <div key={index} className="flex items-center">
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full ${
            index + 1 <= currentStep
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          {index + 1 < currentStep ? (
            <CheckCircleIcon className="w-5 h-5" />
          ) : (
            <span className="text-sm font-medium">{index + 1}</span>
          )}
        </div>
        {index < totalSteps - 1 && (
          <div
            className={`w-16 h-1 mx-4 ${
              index + 1 < currentStep ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          />
        )}
      </div>
    ))}
  </div>
)

// Optimized form input component
const FormInput = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false,
  min,
  step 
}: {
  label: string
  type?: string
  value: string | number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  min?: number
  step?: string
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      min={min}
      step={step}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
)

export default function AddPropertyOptimized() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  
  const [formData, setFormData] = useState<PropertyForm>({
    name: '',
    description: '',
    location: '',
    pricePerNight: 50,
    maxGuests: 1,
    bedrooms: 1,
    bathrooms: 1,
    amenities: [],
    images: []
  })

  // Memoized form validation
  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() && formData.description.trim() && formData.location.trim()
      case 2:
        return formData.pricePerNight > 0 && formData.maxGuests > 0 && formData.bedrooms > 0
      case 3:
        return true // Amenities are optional
      case 4:
        return formData.images.length > 0
      default:
        return false
    }
  }, [currentStep, formData])

  // Optimized form handlers with useCallback
  const updateFormData = useCallback((updates: Partial<PropertyForm>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }, [])

  const handleInputChange = useCallback((field: keyof PropertyForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value
    updateFormData({ [field]: value })
  }, [updateFormData])

  const toggleAmenity = useCallback((amenityId: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }))
  }, [])

  const handleImageUpload = useCallback((files: File[]) => {
    updateFormData({ images: files })
  }, [updateFormData])

  const handleSubmit = useCallback(async () => {
    if (!isConnected || !address) return

    try {
      setIsSubmitting(true)
      setSubmitStatus('idle')

      // Prepare property data
      const propertyData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        pricePerNight: formData.pricePerNight,
        maxGuests: formData.maxGuests,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        amenities: formData.amenities,
        images: formData.images.map((file, index) => `property-${Date.now()}-${index}.jpg`), // Convert File objects to strings for now
        owner: address
      }

      // Call API endpoint
      const response = await fetch('/api/properties/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create property')
      }

      console.log('✅ Property created successfully:', result.property)
      setSubmitStatus('success')
      
      // Redirect after brief success display
      setTimeout(() => {
        router.push('/host')
      }, 2000)
      
    } catch (error) {
      console.error('❌ Error submitting property:', error)
      const message = error instanceof Error ? error.message : 'Failed to create property. Please try again.'
      setErrorMessage(message)
      setSubmitStatus('error')
      setIsSubmitting(false)
    }
  }, [formData, isConnected, address, router])

  const nextStep = useCallback(() => {
    if (currentStep < 4 && isStepValid) {
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep, isStepValid])

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">You need to connect your wallet to list a property.</p>
          <ConnectWallet className="mx-auto" />
        </div>
      </div>
    )
  }

  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Listed Successfully!</h2>
          <p className="text-gray-600 mb-6">Your property has been added and is now live on BaseStay.</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  const renderStep = useMemo(() => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
            
            <FormInput
              label="Property Name"
              value={formData.name}
              onChange={handleInputChange('name')}
              placeholder="e.g., Cozy Downtown Apartment"
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={handleInputChange('description')}
                placeholder="Describe your property, highlight unique features..."
                rows={4}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <FormInput
              label="Location"
              value={formData.location}
              onChange={handleInputChange('location')}
              placeholder="e.g., Downtown, City Center"
              required
            />
          </div>
        )
      
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Property Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Price per Night (USDC)"
                type="number"
                value={formData.pricePerNight}
                onChange={handleInputChange('pricePerNight')}
                min={1}
                step="0.01"
                required
              />
              
              <FormInput
                label="Maximum Guests"
                type="number"
                value={formData.maxGuests}
                onChange={handleInputChange('maxGuests')}
                min={1}
                required
              />
              
              <FormInput
                label="Bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={handleInputChange('bedrooms')}
                min={1}
                required
              />
              
              <FormInput
                label="Bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={handleInputChange('bathrooms')}
                min={1}
                required
              />
            </div>
          </div>
        )
      
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Amenities</h3>
            <p className="text-gray-600">Select the amenities your property offers</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {amenitiesList.map((amenity) => (
                <button
                  key={amenity.id}
                  type="button"
                  onClick={() => toggleAmenity(amenity.id)}
                  className={`flex items-center p-4 border-2 rounded-lg transition-colors ${
                    formData.amenities.includes(amenity.id)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <amenity.icon className="h-6 w-6 mr-3" />
                  <span className="font-medium">{amenity.name}</span>
                </button>
              ))}
            </div>
          </div>
        )
      
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Property Images</h3>
            <p className="text-gray-600">Upload high-quality images of your property</p>
            
            <ImageUploadSection
              images={formData.images}
              onImagesChange={handleImageUpload}
              maxImages={10}
            />
          </div>
        )
      
      default:
        return null
    }
  }, [currentStep, formData, handleInputChange, toggleAmenity, handleImageUpload])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/host"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <HomeIcon className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900">Add New Property</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StepIndicator currentStep={currentStep} totalSteps={4} />
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          {renderStep}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              disabled={!isStepValid}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isStepValid || isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                'Submit Property'
              )}
            </button>
          )}
        </div>

        {submitStatus === 'error' && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">
              {errorMessage || 'Failed to submit property. Please try again.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
