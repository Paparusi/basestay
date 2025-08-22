'use client'

import { useState } from 'react'
import { useBSTToken } from '@/hooks/useBSTToken'
import { useAccount } from 'wagmi'

export default function BSTDashboard() {
  const { address } = useAccount()
  const {
    balance,
    stakedBalance,
    pendingRewards,
    isQualifiedHost,
    discountRate,
    stake,
    unstake,
    claimRewards,
    minHostStake,
    canListProperties,
    discountPercentage
  } = useBSTToken()

  const [stakeAmount, setStakeAmount] = useState('')
  const [unstakeAmount, setUnstakeAmount] = useState('')

  if (!address) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium text-yellow-800 mb-2">
          Connect Wallet to Access BST Features
        </h3>
        <p className="text-yellow-700">
          Connect your wallet to view your BST balance and start earning rewards.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* BST Overview */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-4">BaseStay Token (BST)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/20 rounded-lg p-4">
            <h3 className="text-sm font-medium mb-2">Balance</h3>
            <p className="text-2xl font-bold">{parseFloat(balance).toLocaleString()} BST</p>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <h3 className="text-sm font-medium mb-2">Staked</h3>
            <p className="text-2xl font-bold">{parseFloat(stakedBalance).toLocaleString()} BST</p>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <h3 className="text-sm font-medium mb-2">Pending Rewards</h3>
            <p className="text-2xl font-bold">{parseFloat(pendingRewards).toFixed(4)} BST</p>
          </div>
        </div>
      </div>

      {/* Host Status */}
      <div className={`rounded-lg p-6 ${isQualifiedHost ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-lg font-medium ${isQualifiedHost ? 'text-green-800' : 'text-red-800'}`}>
              Host Status: {isQualifiedHost ? 'Qualified ✅' : 'Not Qualified ❌'}
            </h3>
            <p className={`text-sm ${isQualifiedHost ? 'text-green-600' : 'text-red-600'}`}>
              {isQualifiedHost 
                ? 'You can list properties on BaseStay platform'
                : `Stake minimum ${minHostStake} BST to become a qualified host`
              }
            </p>
          </div>
          {isQualifiedHost && (
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              Can List Properties
            </div>
          )}
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Your BST Benefits</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold">%</span>
            </div>
            <div>
              <p className="font-medium">Platform Fee Discount</p>
              <p className="text-sm text-gray-600">
                {discountPercentage > 0 
                  ? `${discountPercentage}% discount on all bookings`
                  : 'Hold more BST to unlock discounts'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">🏠</span>
            </div>
            <div>
              <p className="font-medium">Property Listing</p>
              <p className="text-sm text-gray-600">
                {canListProperties
                  ? 'List unlimited properties'
                  : 'Stake BST to list properties'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-bold">⭐</span>
            </div>
            <div>
              <p className="font-medium">Staking Rewards</p>
              <p className="text-sm text-gray-600">
                Earn BST rewards for staking tokens
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 font-bold">📈</span>
            </div>
            <div>
              <p className="font-medium">Visibility Boost</p>
              <p className="text-sm text-gray-600">
                Higher stake = better property visibility
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Staking Interface */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stake BST */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Stake BST</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount to Stake
              </label>
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Minimum ${minHostStake} BST`}
              />
            </div>
            <button
              onClick={() => stake(stakeAmount)}
              disabled={!stakeAmount || parseFloat(stakeAmount) < parseFloat(minHostStake)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Stake BST
            </button>
          </div>
        </div>

        {/* Unstake BST */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Unstake BST</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount to Unstake
              </label>
              <input
                type="number"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Max: ${stakedBalance} BST`}
                max={stakedBalance}
              />
            </div>
            <button
              onClick={() => unstake(unstakeAmount)}
              disabled={!unstakeAmount || parseFloat(unstakeAmount) > parseFloat(stakedBalance)}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Unstake BST
            </button>
          </div>
        </div>
      </div>

      {/* Claim Rewards */}
      {parseFloat(pendingRewards) > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-yellow-800">
                Pending Rewards Available
              </h3>
              <p className="text-yellow-700">
                You have {parseFloat(pendingRewards).toFixed(4)} BST rewards ready to claim
              </p>
            </div>
            <button
              onClick={() => claimRewards()}
              className="bg-yellow-600 text-white px-6 py-2 rounded-md hover:bg-yellow-700"
            >
              Claim Rewards
            </button>
          </div>
        </div>
      )}

      {/* BST Tokenomics Info */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">BST Tokenomics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Token Details</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• Total Supply: 10 Billion BST</li>
              <li>• Network: Base Mainnet</li>
              <li>• Standard: ERC-20</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Utility Features</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• Host qualification staking</li>
              <li>• Platform fee discounts</li>
              <li>• Booking and review rewards</li>
              <li>• Property visibility boost</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
