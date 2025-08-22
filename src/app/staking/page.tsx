'use client'

import React, { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { ConnectWalletButton } from '@/components/web3/ConnectWalletButton'
import { CONTRACT_ADDRESSES, BST_CONFIG } from '@/lib/contracts'

// BST Token contract address
const BST_CONTRACT_ADDRESS = CONTRACT_ADDRESSES.BST_TOKEN

// BST Token ABI (simplified for staking functions)
const BST_ABI = [
  {
    inputs: [{ name: 'amount', type: 'uint256' }],
    name: 'stakeForHost',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'amount', type: 'uint256' }],
    name: 'unstake', 
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'claimRewards',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'calculateRewards',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'stakedBalance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'isQualifiedHost',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'MIN_HOST_STAKE',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const

export default function StakingPage() {
  const { address, isConnected } = useAccount()
  const [stakeAmount, setStakeAmount] = useState('')
  const [unstakeAmount, setUnstakeAmount] = useState('')

  // Read contract data
  const { data: balance } = useReadContract({
    address: BST_CONTRACT_ADDRESS,
    abi: BST_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })

  const { data: stakedBalance } = useReadContract({
    address: BST_CONTRACT_ADDRESS,
    abi: BST_ABI,
    functionName: 'stakedBalance',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })

  const { data: pendingRewards } = useReadContract({
    address: BST_CONTRACT_ADDRESS,
    abi: BST_ABI,
    functionName: 'calculateRewards',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })

  const { data: isQualifiedHost } = useReadContract({
    address: BST_CONTRACT_ADDRESS,
    abi: BST_ABI,
    functionName: 'isQualifiedHost',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })

  const { data: minHostStake } = useReadContract({
    address: BST_CONTRACT_ADDRESS,
    abi: BST_ABI,
    functionName: 'MIN_HOST_STAKE'
  })

  // Write contract functions
  const { writeContract: stake, data: stakeHash } = useWriteContract()
  const { writeContract: unstake, data: unstakeHash } = useWriteContract()
  const { writeContract: claimRewards, data: claimHash } = useWriteContract()

  // Transaction receipts
  const { isLoading: isStaking } = useWaitForTransactionReceipt({ hash: stakeHash })
  const { isLoading: isUnstaking } = useWaitForTransactionReceipt({ hash: unstakeHash })
  const { isLoading: isClaiming } = useWaitForTransactionReceipt({ hash: claimHash })

  const handleStake = () => {
    if (!stakeAmount || !address) return
    
    try {
      stake({
        address: BST_CONTRACT_ADDRESS,
        abi: BST_ABI,
        functionName: 'stakeForHost',
        args: [parseEther(stakeAmount)]
      })
    } catch (error) {
      console.error('Stake error:', error)
    }
  }

  const handleUnstake = () => {
    if (!unstakeAmount || !address) return
    
    try {
      unstake({
        address: BST_CONTRACT_ADDRESS,
        abi: BST_ABI,
        functionName: 'unstake',
        args: [parseEther(unstakeAmount)]
      })
    } catch (error) {
      console.error('Unstake error:', error)
    }
  }

  const handleClaimRewards = () => {
    if (!address) return
    
    try {
      claimRewards({
        address: BST_CONTRACT_ADDRESS,
        abi: BST_ABI,
        functionName: 'claimRewards'
      })
    } catch (error) {
      console.error('Claim error:', error)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl text-white font-bold">BST</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">BST Staking</h1>
          <p className="text-gray-600 mb-6">Connect your wallet to start staking BST tokens</p>
          <ConnectWalletButton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-xl text-white font-bold">BST</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">BST Staking</h1>
                <p className="text-gray-600">Stake BST to become a qualified host and earn rewards</p>
              </div>
            </div>
            <ConnectWalletButton />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">BST Balance</p>
                <p className="text-lg font-semibold text-gray-900">
                  {balance ? formatEther(balance) : '0'} BST
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Staked BST</p>
                <p className="text-lg font-semibold text-gray-900">
                  {stakedBalance ? formatEther(stakedBalance) : '0'} BST
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Rewards</p>
                <p className="text-lg font-semibold text-gray-900">
                  {pendingRewards ? formatEther(pendingRewards) : '0'} BST
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isQualifiedHost ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <svg className={`w-6 h-6 ${isQualifiedHost ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Host Status</p>
                <p className={`text-lg font-semibold ${isQualifiedHost ? 'text-green-600' : 'text-gray-400'}`}>
                  {isQualifiedHost ? 'Qualified' : 'Not Qualified'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Staking Panel */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Stake BST</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount to Stake
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder="0.0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute right-3 top-3 text-gray-500">BST</div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Host Requirements:</strong> Stake minimum {minHostStake ? formatEther(minHostStake) : '1,000'} BST to become a qualified host and list properties on BaseStay.
                </p>
              </div>

              <button
                onClick={handleStake}
                disabled={isStaking || !stakeAmount || Number(stakeAmount) <= 0}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isStaking ? 'Staking...' : 'Stake BST'}
              </button>
            </div>
          </div>

          {/* Unstaking Panel */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Unstake & Rewards</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount to Unstake
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={unstakeAmount}
                    onChange={(e) => setUnstakeAmount(e.target.value)}
                    placeholder="0.0"
                    max={stakedBalance ? formatEther(stakedBalance) : '0'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute right-3 top-3 text-gray-500">BST</div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleUnstake}
                  disabled={isUnstaking || !unstakeAmount || Number(unstakeAmount) <= 0}
                  className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUnstaking ? 'Unstaking...' : 'Unstake'}
                </button>

                <button
                  onClick={handleClaimRewards}
                  disabled={isClaiming || !pendingRewards || pendingRewards === 0n}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isClaiming ? 'Claiming...' : 'Claim Rewards'}
                </button>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Rewards:</strong> Earn 1% APY on staked BST. Qualified hosts earn 1.5x bonus rewards. Rewards are calculated and distributed continuously.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-12 bg-white rounded-xl p-8 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">How BST Staking Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Stake BST</h3>
              <p className="text-gray-600">Lock your BST tokens to earn rewards and become eligible to host properties on the platform.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011 1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Become Host</h3>
              <p className="text-gray-600">Stake minimum 1,000 BST to qualify as a host and list your properties on BaseStay.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Earn Rewards</h3>
              <p className="text-gray-600">Receive 1% APY on staked tokens, with 1.5x bonus for qualified hosts. Claim anytime!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
