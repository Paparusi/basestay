'use client'

import { useState } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { formatEther, Address } from 'viem'
import Link from 'next/link'
import {
  HomeIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

const PROPERTY_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_PROPERTY_REGISTRY_ADDRESS as Address

const PROPERTY_REGISTRY_ABI = [
  {
    inputs: [{ name: 'host', type: 'address' }],
    name: 'getHostProperties',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'propertyId', type: 'uint256' }],
    name: 'getProperty',
    outputs: [
      {
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'host', type: 'address' },
          { name: 'metadataURI', type: 'string' },
          { name: 'pricePerNight', type: 'uint256' },
          { name: 'bstStaked', type: 'uint256' },
          { name: 'isActive', type: 'bool' }
        ],
        name: '',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'host', type: 'address' }],
    name: 'totalStakedBST',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const

interface Property {
  id: bigint
  host: string
  metadataURI: string
  pricePerNight: bigint
  bstStaked: bigint
  isActive: boolean
}

function PropertyCard({ property }: { property: Property }) {
  let metadata: { title?: string; location?: string; description?: string; images?: string[] } = {}
  
  try {
    if (property.metadataURI.startsWith('data:application/json;base64,')) {
      const jsonString = atob(property.metadataURI.split(',')[1])
      metadata = JSON.parse(jsonString)
    }
  } catch (error) {
    console.error('Error parsing metadata:', error)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {metadata.title || `Property #${property.id.toString()}`}
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            {metadata.location || 'Location not specified'}
          </p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          property.isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {property.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Price per night:</span>
          <span className="font-medium">{formatEther(property.pricePerNight)} USDC</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">BST Staked:</span>
          <span className="font-medium text-blue-600">{formatEther(property.bstStaked)} BST</span>
        </div>
        {metadata.description && (
          <div className="text-sm text-gray-600 mt-2">
            <p className="line-clamp-2">{metadata.description}</p>
          </div>
        )}
      </div>

      <div className="flex space-x-2 mt-4 pt-4 border-t">
        <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100">
          <EyeIcon className="w-4 h-4" />
          <span>View</span>
        </button>
        <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100">
          <PencilIcon className="w-4 h-4" />
          <span>Edit</span>
        </button>
        <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm bg-red-50 text-red-700 rounded-md hover:bg-red-100">
          <TrashIcon className="w-4 h-4" />
          <span>Remove</span>
        </button>
      </div>
    </div>
  )
}

export default function HostDashboard() {
  const { address } = useAccount()

  // Get host's property IDs
  const { data: propertyIds } = useReadContract({
    address: PROPERTY_REGISTRY_ADDRESS,
    abi: PROPERTY_REGISTRY_ABI,
    functionName: 'getHostProperties',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })

  // Get total staked BST
  const { data: totalStaked } = useReadContract({
    address: PROPERTY_REGISTRY_ADDRESS,
    abi: PROPERTY_REGISTRY_ABI,
    functionName: 'totalStakedBST',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })

  if (!address) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-yellow-800 mb-2">
              Connect Wallet to Access Host Dashboard
            </h3>
            <p className="text-yellow-700">
              Connect your wallet to manage your properties and view earnings.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Host Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage your properties and track your earnings on BaseStay.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <HomeIcon className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {propertyIds?.length || 0}
                </p>
                <p className="text-gray-600">Total Properties</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">BST</span>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {totalStaked ? formatEther(totalStaked) : '0'}
                </p>
                <p className="text-gray-600">Total BST Staked</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">$</span>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-gray-600">Total Earnings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-8">
          <Link
            href="/list-property"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5" />
            <span>List New Property</span>
          </Link>
        </div>

        {/* Properties */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Properties</h2>
          
          {(!propertyIds || propertyIds.length === 0) ? (
            <div className="text-center py-12">
              <HomeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Listed</h3>
              <p className="text-gray-600 mb-6">
                Start earning by listing your first property on BaseStay.
              </p>
              <Link
                href="/list-property"
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
              >
                <PlusIcon className="w-5 h-5" />
                <span>List Your First Property</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {propertyIds.map((propertyId) => (
                <PropertyCardWrapper key={propertyId.toString()} propertyId={propertyId} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PropertyCardWrapper({ propertyId }: { propertyId: bigint }) {
  const { data: property } = useReadContract({
    address: PROPERTY_REGISTRY_ADDRESS,
    abi: PROPERTY_REGISTRY_ABI,
    functionName: 'getProperty',
    args: [propertyId]
  })

  if (!property) {
    return (
      <div className="bg-gray-200 rounded-lg p-6 animate-pulse">
        <div className="h-4 bg-gray-300 rounded mb-2"></div>
        <div className="h-3 bg-gray-300 rounded mb-4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-300 rounded"></div>
          <div className="h-3 bg-gray-300 rounded"></div>
        </div>
      </div>
    )
  }

  return <PropertyCard property={property} />
}
