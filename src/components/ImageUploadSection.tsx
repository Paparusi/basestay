'use client'

import { useCallback } from 'react'
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface ImageUploadSectionProps {
  images: File[]
  onImagesChange: (files: File[]) => void
  maxImages?: number
}

export default function ImageUploadSection({
  images,
  onImagesChange,
  maxImages = 10
}: ImageUploadSectionProps) {
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (validFiles.length > 0) {
      const newImages = [...images, ...validFiles].slice(0, maxImages)
      onImagesChange(newImages)
    }
  }, [images, onImagesChange, maxImages])

  const removeImage = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }, [images, onImagesChange])

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
        <div className="text-center">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Upload property images
              </span>
              <span className="mt-1 block text-sm text-gray-500">
                PNG, JPG, WEBP up to 10MB each
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <span className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                Choose Files
              </span>
            </label>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {images.length}/{maxImages} images uploaded
          </p>
        </div>
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((file, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Property image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
              <p className="mt-1 text-xs text-gray-500 truncate">
                {file.name}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
