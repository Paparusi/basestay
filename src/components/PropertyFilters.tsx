'use client'

import React, { useState } from 'react'
import { 
  AdjustmentsHorizontalIcon,
  HomeIcon,
  UserGroupIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'

interface PropertyFiltersProps {
  onFiltersChange: (filters: any) => void
}

const PropertyFilters = ({ onFiltersChange }: PropertyFiltersProps) => {
  const [filters, setFilters] = useState({
    priceRange: [0, 500],
    bedrooms: 0,
    guests: 0,
    propertyType: 'all'
  })

  const propertyTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'cabin', label: 'Cabin' },
    { value: 'loft', label: 'Loft' }
  ]

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 flex items-center">
        <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
        Filters
      </h3>
      
      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price Range (per night)
        </label>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-1" />
            <input
              type="number"
              placeholder="Min"
              value={filters.priceRange[0]}
              onChange={(e) => handleFilterChange('priceRange', [Number(e.target.value), filters.priceRange[1]])}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <span className="text-gray-500">to</span>
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-1" />
            <input
              type="number"
              placeholder="Max"
              value={filters.priceRange[1]}
              onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], Number(e.target.value)])}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>
      </div>

      {/* Property Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Property Type
        </label>
        <select
          value={filters.propertyType}
          onChange={(e) => handleFilterChange('propertyType', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {propertyTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      {/* Bedrooms */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Minimum Bedrooms
        </label>
        <div className="flex items-center space-x-2">
          <HomeIcon className="h-4 w-4 text-gray-400" />
          <select
            value={filters.bedrooms}
            onChange={(e) => handleFilterChange('bedrooms', Number(e.target.value))}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value={0}>Any</option>
            <option value={1}>1+</option>
            <option value={2}>2+</option>
            <option value={3}>3+</option>
            <option value={4}>4+</option>
          </select>
        </div>
      </div>

      {/* Guests */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Number of Guests
        </label>
        <div className="flex items-center space-x-2">
          <UserGroupIcon className="h-4 w-4 text-gray-400" />
          <select
            value={filters.guests}
            onChange={(e) => handleFilterChange('guests', Number(e.target.value))}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value={0}>Any</option>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
            <option value={6}>6+</option>
          </select>
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={() => {
          const resetFilters = {
            priceRange: [0, 500],
            bedrooms: 0,
            guests: 0,
            propertyType: 'all'
          }
          setFilters(resetFilters)
          onFiltersChange(resetFilters)
        }}
        className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
      >
        Reset Filters
      </button>
    </div>
  )
}

export default PropertyFilters
