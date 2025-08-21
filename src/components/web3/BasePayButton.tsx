'use client'

import { useWeb3 } from '@/components/web3/Web3Provider'

interface PaymentResult {
  id: string
  status: string
}

interface PaymentError extends Error {
  message: string
}

export function BasePayButton({ 
  amount, 
  to, 
  onSuccess, 
  onError,
  children,
  disabled = false
}: {
  amount: string
  to: string
  onSuccess?: (result: PaymentResult) => void
  onError?: (error: PaymentError) => void
  children: React.ReactNode
  disabled?: boolean
}) {
  const { isConnected } = useWeb3()

  const handlePayment = async () => {
    try {
      if (!isConnected) {
        throw new Error('Wallet not connected')
      }

      // Use Base Pay for USDC payments
      const result = await (window as unknown as { base: { pay: (params: unknown) => Promise<PaymentResult>, getPaymentStatus: (params: unknown) => Promise<{ status: string }> } }).base.pay({
        amount: amount, // USD amount - SDK quotes equivalent USDC
        to: to,
        testnet: false // Use mainnet
      })

      const status = await (window as unknown as { base: { pay: (params: unknown) => Promise<PaymentResult>, getPaymentStatus: (params: unknown) => Promise<{ status: string }> } }).base.getPaymentStatus({
        id: result.id,
        testnet: false
      })

      if (status.status === 'completed') {
        onSuccess?.(result)
      } else {
        throw new Error(`Payment ${status.status}`)
      }

    } catch (error) {
      console.error('Payment failed:', error)
      onError?.(error as PaymentError)
    }
  }

  return (
    <button
      onClick={handlePayment}
      disabled={disabled || !isConnected}
      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors"
    >
      {children}
    </button>
  )
}
