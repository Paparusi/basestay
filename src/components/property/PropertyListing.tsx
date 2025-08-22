'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { parseEther, formatEther } from 'viem'

const PROPERTY_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_PROPERTY_REGISTRY_ADDRESS as `0x${string}`

const PROPERTY_REGISTRY_ABI = [
  {
    inputs: [
      { name: 'metadataURI', type: 'string' },
      { name: 'pricePerNight', type: 'uint256' },
      { name: 'bstStakeAmount', type: 'uint256' }
    ],
    name: 'listProperty',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'MIN_BST_STAKE',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const

export default function PropertyListing() {
  const { address } = useAccount()
  const { writeContract, isPending } = useWriteContract()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    pricePerNight: '',
    bstStakeAmount: '1000'
  })

  // Read minimum BST stake from contract
  const { data: minBSTStake } = useReadContract({
    address: PROPERTY_REGISTRY_ADDRESS,
    abi: PROPERTY_REGISTRY_ABI,
    functionName: 'MIN_BST_STAKE'
  })

  const minStakeFormatted = minBSTStake ? formatEther(minBSTStake) : '1000'

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement
    setFormData(prev => ({ ...prev, [target.name]: target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!address) {
      window.alert('Please connect your wallet')
      return
    }

    const stakeAmount = parseFloat(formData.bstStakeAmount)

    if (stakeAmount < parseFloat(minStakeFormatted)) {
      window.alert(`Minimum BST stake is ${minStakeFormatted} BST`)
      return
    }

    // Create metadata
    const metadata = {
      title: formData.title,
      description: formData.description,
      location: formData.location,
      images: [],
      amenities: [],
      createdAt: new Date().toISOString()
    }

    const metadataURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`

    try {
      writeContract({
        address: PROPERTY_REGISTRY_ADDRESS,
        abi: PROPERTY_REGISTRY_ABI,
        functionName: 'listProperty',
        args: [
          metadataURI,
          parseEther(formData.pricePerNight),
          parseEther(formData.bstStakeAmount)
        ]
      })

      setFormData({
        title: '',
        description: '',
        location: '',
        pricePerNight: '',
        bstStakeAmount: '1000'
      })
    } catch (error) {
      console.error('Error listing property:', error)
      window.alert('Failed to list property. Please try again.')
    }
  }

  if (!address) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium text-yellow-800 mb-2">
          Connect Wallet to List Property
        </h3>
        <p className="text-yellow-700">
          Connect your wallet to list properties on BaseStay platform.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">List Your Property</h2>
        <p className="text-gray-600">
          Stake minimum {minStakeFormatted} BST to list your property on BaseStay
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Property Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Beautiful beachfront villa"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe your property..."
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Miami Beach, Florida"
          />
        </div>

        <div>
          <label htmlFor="pricePerNight" className="block text-sm font-medium text-gray-700 mb-2">
            Price per Night (USDC) *
          </label>
          <input
            type="number"
            id="pricePerNight"
            name="pricePerNight"
            value={formData.pricePerNight}
            onChange={handleInputChange}
            required
            min="1"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="150.00"
          />
        </div>

        <div>
          <label htmlFor="bstStakeAmount" className="block text-sm font-medium text-gray-700 mb-2">
            BST Stake Amount *
          </label>
          <input
            type="number"
            id="bstStakeAmount"
            name="bstStakeAmount"
            value={formData.bstStakeAmount}
            onChange={handleInputChange}
            required
            min={minStakeFormatted}
            step="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`Minimum ${minStakeFormatted} BST`}
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">BST Staking Benefits:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Higher stake = better property visibility</li>
            <li>• Minimum {minStakeFormatted} BST required</li>
            <li>• Stake returned when property deactivated</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isPending ? 'Listing Property...' : 'List Property & Stake BST'}
        </button>
      </form>
    </div>
  )
}
