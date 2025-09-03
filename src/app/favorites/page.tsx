'use client'

import React from 'react'
import { HeartIcon } from '@heroicons/react/24/outline'
import { useAccount } from 'wagmi'
import Breadcrumb from '@/components/navigation/Breadcrumb'
import { GuestNavigationButtons } from '@/components/navigation/PageNavigationButtons'
import { ConnectWalletButton } from '@/components/web3/ConnectWalletButton'

export default function FavoritesPage() {
  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb />
          
          <div className="text-center py-20">
            <HeartIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h1 className="mt-4 text-3xl font-bold text-gray-900">Danh sách yêu thích</h1>
            <p className="mt-2 text-gray-600 mb-8">
              Vui lòng kết nối ví để xem các chỗ ở yêu thích của bạn.
            </p>
            <ConnectWalletButton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb />

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Danh sách yêu thích</h1>
          <p className="text-gray-600">Các chỗ ở bạn đã lưu để xem sau</p>
        </div>

        {/* Navigation Buttons */}
        <div className="mb-8">
          <GuestNavigationButtons />
        </div>

        {/* Favorites List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="text-center py-12">
              <HeartIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có yêu thích</h3>
              <p className="mt-1 text-sm text-gray-500">
                Bắt đầu khám phá và lưu những chỗ ở bạn thích.
              </p>
              <div className="mt-6">
                <GuestNavigationButtons />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
