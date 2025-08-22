'use client'

import { useState, useCallback } from 'react'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { useBSTToken } from '@/hooks/useBSTToken'

const PROPERTY_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_PROPERTY_REGISTRY_ADDRESS as `0x${string}`
const BST_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_BST_TOKEN_ADDRESS as `0x${string}`

// Property Registry ABI (simplified)
const PROPERTY_REGISTRY_ABI = [
  {
    inputs: [
      { name: "metadataURI", type: "string" },
      { name: "pricePerNight", type: "uint256" },
      { name: "bstStakeAmount", type: "uint256" }
    ],
    name: "listProperty",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "getProperty",
    outputs: [{
      components: [
        { name: "id", type: "uint256" },
        { name: "host", type: "address" },
        { name: "metadataURI", type: "string" },
        { name: "pricePerNight", type: "uint256" },
        { name: "bstStaked", type: "uint256" },
        { name: "isActive", type: "bool" }
      ],
      type: "tuple"
    }],
    stateMutability: "view",
    type: "function"
  }
] as const

// BST Token ABI for approval
const BST_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" }
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const

interface PropertyFormData {
  name: string
  description: string
  location: string
  pricePerNight: number
  maxGuests: number
  bedrooms: number
  bathrooms: number
  propertyType: string
  amenities: string[]
  images: string[]
  checkInTime: string
  checkOutTime: string
  bstStakeAmount: number
}

export function usePropertyListing() {
  const { address } = useAccount()
  const { balance, canListProperties } = useBSTToken()
  const { writeContract } = useWriteContract()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check BST allowance
  const { data: allowance } = useReadContract({
    address: BST_TOKEN_ADDRESS,
    abi: BST_ABI,
    functionName: 'allowance',
    args: address ? [address, PROPERTY_REGISTRY_ADDRESS] : undefined,
    query: { enabled: !!address }
  })

  const createPropertyMetadata = useCallback((formData: PropertyFormData) => {
    return {
      name: formData.name,
      description: formData.description,
      location: formData.location,
      pricePerNight: formData.pricePerNight,
      maxGuests: formData.maxGuests,
      bedrooms: formData.bedrooms,
      bathrooms: formData.bathrooms,
      propertyType: formData.propertyType,
      amenities: formData.amenities,
      images: formData.images,
      checkInTime: formData.checkInTime,
      checkOutTime: formData.checkOutTime,
      createdAt: new Date().toISOString(),
      version: "1.0"
    }
  }, [])

  const listProperty = useCallback(async (formData: PropertyFormData) => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    if (!canListProperties) {
      throw new Error('You need to stake minimum 1000 BST to list properties')
    }

    if (parseFloat(balance) < formData.bstStakeAmount) {
      throw new Error(`Insufficient BST balance. You have ${balance} BST but need ${formData.bstStakeAmount} BST`)
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Step 1: Create metadata
      const metadata = createPropertyMetadata(formData)
      
      // Convert to base64 data URI (for simplicity - in production use IPFS)
      const metadataString = JSON.stringify(metadata)
      const metadataURI = `data:application/json;base64,${btoa(metadataString)}`

      const stakeAmountWei = parseEther(formData.bstStakeAmount.toString())
      const pricePerNightWei = BigInt(formData.pricePerNight * 1e6) // USDC has 6 decimals

      // Step 2: Check if we need to approve BST
      const currentAllowance = allowance || 0n
      
      if (currentAllowance < stakeAmountWei) {
        console.log('Approving BST spending...')
        
        await new Promise<void>((resolve, reject) => {
          writeContract({
            address: BST_TOKEN_ADDRESS,
            abi: BST_ABI,
            functionName: 'approve',
            args: [PROPERTY_REGISTRY_ADDRESS, stakeAmountWei]
          }, {
            onSuccess: () => {
              console.log('BST approval successful')
              resolve()
            },
            onError: (error) => {
              console.error('BST approval failed:', error)
              reject(error)
            }
          })
        })

        // Wait for approval to be mined
        await new Promise(resolve => setTimeout(resolve, 3000))
      }

      // Step 3: List property on contract
      console.log('Listing property on blockchain...')
      
      await new Promise<void>((resolve, reject) => {
        writeContract({
          address: PROPERTY_REGISTRY_ADDRESS,
          abi: PROPERTY_REGISTRY_ABI,
          functionName: 'listProperty',
          args: [metadataURI, pricePerNightWei, stakeAmountWei]
        }, {
          onSuccess: (hash) => {
            console.log('Property listing successful, tx hash:', hash)
            resolve()
          },
          onError: (error) => {
            console.error('Property listing failed:', error)
            reject(error)
          }
        })
      })

      // Step 4: Save to database
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          ownerAddress: address,
          metadataURI,
          bstStaked: formData.bstStakeAmount
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save property to database')
      }

      const result = await response.json()
      
      return {
        success: true,
        propertyId: result.id,
        message: `Property listed successfully! You staked ${formData.bstStakeAmount} BST.`
      }

    } catch (error: any) {
      console.error('Property listing error:', error)
      setError(error.message || 'Failed to list property')
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }, [address, balance, canListProperties, allowance, writeContract, createPropertyMetadata])

  return {
    listProperty,
    isSubmitting,
    error,
    canListProperties,
    balance,
    needsApproval: allowance ? allowance < parseEther("1000") : true
  }
}
