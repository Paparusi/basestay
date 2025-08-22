'use client'

import React from 'react'
import { useReadContract } from 'wagmi'
import { CONTRACT_ADDRESSES } from '@/lib/contracts'

const BST_ABI = [
  {
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const

export default function TokenStatusPage() {
  // Read contract data
  const { data: isPaused } = useReadContract({
    address: CONTRACT_ADDRESSES.BST_TOKEN,
    abi: BST_ABI,
    functionName: 'paused'
  })

  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESSES.BST_TOKEN,
    abi: BST_ABI,
    functionName: 'owner'
  })

  const { data: totalSupply } = useReadContract({
    address: CONTRACT_ADDRESSES.BST_TOKEN,
    abi: BST_ABI,
    functionName: 'totalSupply'
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">BST Token Status</h1>
          
          <div className="space-y-6">
            {/* Contract Address */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Contract Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Contract Address:</span>
                  <div className="flex items-center space-x-2">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                      {CONTRACT_ADDRESSES.BST_TOKEN}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(CONTRACT_ADDRESSES.BST_TOKEN)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Network:</span>
                  <span className="font-medium">Base Mainnet</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Symbol:</span>
                  <span className="font-medium">BST</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Decimals:</span>
                  <span className="font-medium">18</span>
                </div>
              </div>
            </div>

            {/* Token Status */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Token Status</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Contract Status:</span>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isPaused === false 
                      ? 'bg-green-100 text-green-800' 
                      : isPaused === true 
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {isPaused === false 
                      ? '✅ Active' 
                      : isPaused === true 
                        ? '⏸️ Paused' 
                        : '⏳ Loading...'}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Supply:</span>
                  <span className="font-medium">
                    {totalSupply 
                      ? `${(Number(totalSupply) / 1e18).toLocaleString()} BST`
                      : 'Loading...'
                    }
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Owner:</span>
                  <div className="flex items-center space-x-2">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                      {owner ? `${owner.slice(0, 10)}...${owner.slice(-8)}` : 'Loading...'}
                    </code>
                    {owner && (
                      <button
                        onClick={() => navigator.clipboard.writeText(owner)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Copy
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Transfer Issues */}
            {isPaused === true && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-red-800 mb-2">⚠️ Transfer Issues Detected</h3>
                <div className="space-y-2 text-red-700">
                  <p>
                    <strong>Problem:</strong> BST token contract is currently paused.
                  </p>
                  <p>
                    <strong>Impact:</strong> All transfers, including sending tokens to other addresses, are blocked.
                  </p>
                  <p>
                    <strong>Solution:</strong> Contract owner needs to unpause the token contract.
                  </p>
                </div>
              </div>
            )}

            {isPaused === false && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-green-800 mb-2">✅ Token Working Correctly</h3>
                <div className="space-y-2 text-green-700">
                  <p>
                    BST token contract is active and transfers should work normally.
                  </p>
                  <p>
                    If you're still having transfer issues, check:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Sufficient BST balance</li>
                    <li>Correct recipient address</li>
                    <li>Sufficient ETH for gas fees</li>
                    <li>Base network selected in wallet</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <a
                  href={`https://basescan.org/token/${CONTRACT_ADDRESSES.BST_TOKEN}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  View on BaseScan →
                </a>
                
                <a
                  href="/staking"
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Staking →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
