import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatUSDC(amount: bigint | string | number): string {
  const value = typeof amount === 'bigint' ? Number(amount) : Number(amount)
  return (value / 1e6).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  })
}

export function parseUSDC(amount: string | number): bigint {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount
  return BigInt(Math.round(value * 1e6))
}

export function formatDate(date: Date | string | number): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string | number): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

export function calculateNights(checkIn: Date, checkOut: Date): number {
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function calculateTotal(pricePerNight: number, nights: number): number {
  return pricePerNight * nights
}

export function calculatePlatformFee(total: number, feeRate: number = 0.025): number {
  return total * feeRate
}

export function isValidDateRange(checkIn: Date, checkOut: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  return (
    checkIn >= today &&
    checkOut > checkIn &&
    calculateNights(checkIn, checkOut) <= 365 // Max 1 year booking
  )
}

export function generateBookingId(): string {
  return `BST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function shortenHash(hash: string, length: number = 8): string {
  if (!hash) return ''
  if (hash.length <= length * 2) return hash
  return `${hash.slice(0, length)}...${hash.slice(-length)}`
}
