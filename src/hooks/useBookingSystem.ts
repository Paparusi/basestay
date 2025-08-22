'use client'

import { useState, useCallback } from 'react'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'

const BOOKING_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_BOOKING_MANAGER_ADDRESS as `0x${string}`
const USDC_ADDRESS = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913' // Base USDC

// Booking Manager ABI (simplified)
const BOOKING_MANAGER_ABI = [
  {
    inputs: [
      { name: "propertyId", type: "uint256" },
      { name: "checkIn", type: "uint256" },
      { name: "checkOut", type: "uint256" },
      { name: "guests", type: "uint256" }
    ],
    name: "createBooking",
    outputs: [{ name: "bookingId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "bookingId", type: "uint256" }],
    name: "confirmBooking",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "bookingId", type: "uint256" }],
    name: "cancelBooking",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "bookingId", type: "uint256" }],
    name: "getBooking",
    outputs: [{
      components: [
        { name: "id", type: "uint256" },
        { name: "propertyId", type: "uint256" },
        { name: "guest", type: "address" },
        { name: "checkIn", type: "uint256" },
        { name: "checkOut", type: "uint256" },
        { name: "guests", type: "uint256" },
        { name: "totalAmount", type: "uint256" },
        { name: "status", type: "uint8" }
      ],
      type: "tuple"
    }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "propertyId", type: "uint256" },
      { name: "checkIn", type: "uint256" },
      { name: "checkOut", type: "uint256" },
      { name: "guests", type: "uint256" }
    ],
    name: "calculateTotalCost",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const

// USDC ABI for approval
const USDC_ABI = [
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
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const

interface BookingData {
  propertyId: number
  checkIn: Date
  checkOut: Date
  guests: number
  pricePerNight: number
}

export function useBookingSystem() {
  const { address } = useAccount()
  const { writeContract } = useWriteContract()
  
  const [isBooking, setIsBooking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get USDC balance
  const { data: usdcBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })

  // Check USDC allowance
  const { data: usdcAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address ? [address, BOOKING_MANAGER_ADDRESS] : undefined,
    query: { enabled: !!address }
  })

  const calculateBookingCost = useCallback((bookingData: BookingData) => {
    const { checkIn, checkOut, pricePerNight } = bookingData
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    const subtotal = nights * pricePerNight
    const platformFee = subtotal * 0.025 // 2.5% platform fee
    const total = subtotal + platformFee

    return {
      nights,
      subtotal,
      platformFee,
      total,
      pricePerNight
    }
  }, [])

  const calculateTotalCostOnChain = useCallback(async (bookingData: BookingData) => {
    const checkInTimestamp = Math.floor(bookingData.checkIn.getTime() / 1000)
    const checkOutTimestamp = Math.floor(bookingData.checkOut.getTime() / 1000)

    try {
      const { data: totalCost } = await useReadContract({
        address: BOOKING_MANAGER_ADDRESS,
        abi: BOOKING_MANAGER_ABI,
        functionName: 'calculateTotalCost',
        args: [
          BigInt(bookingData.propertyId),
          BigInt(checkInTimestamp),
          BigInt(checkOutTimestamp),
          BigInt(bookingData.guests)
        ]
      })

      return totalCost ? formatUnits(totalCost, 6) : '0' // USDC has 6 decimals
    } catch (error) {
      console.error('Error calculating cost on-chain:', error)
      return '0'
    }
  }, [])

  const createBooking = useCallback(async (bookingData: BookingData) => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    setIsBooking(true)
    setError(null)

    try {
      const cost = calculateBookingCost(bookingData)
      const totalAmountUsdc = parseUnits(cost.total.toString(), 6) // USDC has 6 decimals

      // Check USDC balance
      const balance = usdcBalance || 0n
      if (balance < totalAmountUsdc) {
        throw new Error(`Insufficient USDC balance. Need ${cost.total} USDC but have ${formatUnits(balance, 6)} USDC`)
      }

      // Check if we need to approve USDC
      const currentAllowance = usdcAllowance || 0n
      
      if (currentAllowance < totalAmountUsdc) {
        console.log('Approving USDC spending...')
        
        await new Promise<void>((resolve, reject) => {
          writeContract({
            address: USDC_ADDRESS,
            abi: USDC_ABI,
            functionName: 'approve',
            args: [BOOKING_MANAGER_ADDRESS, totalAmountUsdc]
          }, {
            onSuccess: () => {
              console.log('USDC approval successful')
              resolve()
            },
            onError: (error) => {
              console.error('USDC approval failed:', error)
              reject(error)
            }
          })
        })

        // Wait for approval to be mined
        await new Promise(resolve => setTimeout(resolve, 3000))
      }

      // Create booking on contract
      const checkInTimestamp = Math.floor(bookingData.checkIn.getTime() / 1000)
      const checkOutTimestamp = Math.floor(bookingData.checkOut.getTime() / 1000)

      console.log('Creating booking on blockchain...')
      
      let bookingId: bigint
      
      await new Promise<void>((resolve, reject) => {
        writeContract({
          address: BOOKING_MANAGER_ADDRESS,
          abi: BOOKING_MANAGER_ABI,
          functionName: 'createBooking',
          args: [
            BigInt(bookingData.propertyId),
            BigInt(checkInTimestamp),
            BigInt(checkOutTimestamp),
            BigInt(bookingData.guests)
          ]
        }, {
          onSuccess: (hash, context) => {
            console.log('Booking creation successful, tx hash:', hash)
            // Note: In a real implementation, we'd listen for the transaction receipt
            // to get the actual booking ID from the event logs
            bookingId = BigInt(Date.now()) // Placeholder
            resolve()
          },
          onError: (error) => {
            console.error('Booking creation failed:', error)
            reject(error)
          }
        })
      })

      // Save booking to database
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: bookingData.propertyId,
          guestAddress: address,
          checkIn: bookingData.checkIn.toISOString(),
          checkOut: bookingData.checkOut.toISOString(),
          guests: bookingData.guests,
          totalAmount: cost.total,
          platformFee: cost.platformFee,
          nights: cost.nights,
          pricePerNight: cost.pricePerNight,
          onChainBookingId: bookingId!.toString(),
          status: 'confirmed'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save booking to database')
      }

      const result = await response.json()
      
      return {
        success: true,
        bookingId: result.id,
        onChainBookingId: bookingId!.toString(),
        totalAmount: cost.total,
        message: `Booking confirmed! You paid ${cost.total} USDC.`
      }

    } catch (error: any) {
      console.error('Booking error:', error)
      setError(error.message || 'Failed to create booking')
      throw error
    } finally {
      setIsBooking(false)
    }
  }, [address, usdcBalance, usdcAllowance, writeContract, calculateBookingCost])

  const cancelBooking = useCallback(async (onChainBookingId: string) => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    try {
      setIsBooking(true)
      setError(null)

      console.log('Canceling booking on blockchain...')
      
      await new Promise<void>((resolve, reject) => {
        writeContract({
          address: BOOKING_MANAGER_ADDRESS,
          abi: BOOKING_MANAGER_ABI,
          functionName: 'cancelBooking',
          args: [BigInt(onChainBookingId)]
        }, {
          onSuccess: (hash) => {
            console.log('Booking cancellation successful, tx hash:', hash)
            resolve()
          },
          onError: (error) => {
            console.error('Booking cancellation failed:', error)
            reject(error)
          }
        })
      })

      // Update booking status in database
      const response = await fetch(`/api/bookings/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          onChainBookingId,
          guestAddress: address
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update booking status')
      }

      return {
        success: true,
        message: 'Booking cancelled successfully. Refund will be processed.'
      }

    } catch (error: any) {
      console.error('Cancellation error:', error)
      setError(error.message || 'Failed to cancel booking')
      throw error
    } finally {
      setIsBooking(false)
    }
  }, [address, writeContract])

  return {
    createBooking,
    cancelBooking,
    calculateBookingCost,
    calculateTotalCostOnChain,
    isBooking,
    error,
    usdcBalance: usdcBalance ? formatUnits(usdcBalance, 6) : '0',
    needsApproval: (amount: string) => {
      const allowance = usdcAllowance || 0n
      const requiredAmount = parseUnits(amount, 6)
      return allowance < requiredAmount
    }
  }
}
