'use client'

import React, { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAccount } from 'wagmi'
import {
  HomeIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
  HeartIcon,
  Cog6ToothIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline'

interface QuickNavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  requireAuth?: boolean
  category: 'guest' | 'host' | 'account'
  color: string
}

export default function QuickNavigationPanel() {
  const [isExpanded, setIsExpanded] = useState(false)
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const pathname = usePathname()

  const quickNavItems: QuickNavItem[] = [
    // Guest items
    {
      name: 'Trang chủ',
      href: '/',
      icon: HomeIcon,
      description: 'Về trang chủ BaseStay',
      category: 'guest',
      color: 'blue'
    },
    {
      name: 'Tìm kiếm',
      href: '/search',
      icon: MagnifyingGlassIcon,
      description: 'Tìm chỗ ở phù hợp',
      category: 'guest',
      color: 'purple'
    },
    {
      name: 'Yêu thích',
      href: '/favorites',
      icon: HeartIcon,
      description: 'Các chỗ ở đã lưu',
      requireAuth: true,
      category: 'guest',
      color: 'red'
    },
    // Host items
    {
      name: 'Đăng chỗ ở',
      href: '/host/properties/new',
      icon: PlusCircleIcon,
      description: 'Tạo tin đăng mới',
      requireAuth: true,
      category: 'host',
      color: 'green'
    },
    {
      name: 'Dashboard',
      href: '/host/dashboard',
      icon: ChartBarIcon,
      description: 'Quản lý chỗ ở',
      requireAuth: true,
      category: 'host',
      color: 'indigo'
    },
    {
      name: 'Thu nhập',
      href: '/host/earnings',
      icon: CurrencyDollarIcon,
      description: 'Xem doanh thu',
      requireAuth: true,
      category: 'host',
      color: 'yellow'
    },
    // Account items
    {
      name: 'Hồ sơ',
      href: '/profile',
      icon: UserCircleIcon,
      description: 'Thông tin cá nhân',
      requireAuth: true,
      category: 'account',
      color: 'gray'
    },
    {
      name: 'Cài đặt',
      href: '/settings',
      icon: Cog6ToothIcon,
      description: 'Cài đặt tài khoản',
      requireAuth: true,
      category: 'account',
      color: 'slate'
    }
  ]

  const getColorClasses = (color: string, isActive: boolean = false) => {
    const colors = {
      blue: isActive ? 'bg-blue-100 text-blue-700 border-blue-200' : 'hover:bg-blue-50 text-blue-600 border-blue-200',
      purple: isActive ? 'bg-purple-100 text-purple-700 border-purple-200' : 'hover:bg-purple-50 text-purple-600 border-purple-200',
      red: isActive ? 'bg-red-100 text-red-700 border-red-200' : 'hover:bg-red-50 text-red-600 border-red-200',
      green: isActive ? 'bg-green-100 text-green-700 border-green-200' : 'hover:bg-green-50 text-green-600 border-green-200',
      indigo: isActive ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'hover:bg-indigo-50 text-indigo-600 border-indigo-200',
      yellow: isActive ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'hover:bg-yellow-50 text-yellow-600 border-yellow-200',
      gray: isActive ? 'bg-gray-100 text-gray-700 border-gray-200' : 'hover:bg-gray-50 text-gray-600 border-gray-200',
      slate: isActive ? 'bg-slate-100 text-slate-700 border-slate-200' : 'hover:bg-slate-50 text-slate-600 border-slate-200'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const isActivePath = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const handleNavigation = (item: QuickNavItem) => {
    if (item.requireAuth && !isConnected) {
      alert('Vui lòng kết nối ví để truy cập tính năng này!')
      return
    }
    router.push(item.href)
  }

  const categorizeItems = (category: string) => {
    return quickNavItems.filter(item => item.category === category)
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {/* Expand/Collapse Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mb-3 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center"
        title={isExpanded ? 'Thu gọn menu' : 'Mở menu nhanh'}
      >
        {isExpanded ? (
          <ChevronDownIcon className="h-6 w-6" />
        ) : (
          <ChevronUpIcon className="h-6 w-6" />
        )}
      </button>

      {/* Navigation Panel */}
      {isExpanded && (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ArrowRightIcon className="h-5 w-5 mr-2 text-blue-600" />
            Chuyển trang nhanh
          </h3>

          {/* Guest Section */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide">
              🏠 Khách hàng
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {categorizeItems('guest').map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item)}
                  disabled={item.requireAuth && !isConnected}
                  className={`flex items-center p-3 rounded-lg border-2 transition-all duration-200 text-left w-full ${
                    isActivePath(item.href)
                      ? getColorClasses(item.color, true)
                      : getColorClasses(item.color, false)
                  } ${
                    item.requireAuth && !isConnected 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'cursor-pointer'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs opacity-70">{item.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Host Section */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide">
              🏡 Chủ nhà
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {categorizeItems('host').map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item)}
                  disabled={item.requireAuth && !isConnected}
                  className={`flex items-center p-3 rounded-lg border-2 transition-all duration-200 text-left w-full ${
                    isActivePath(item.href)
                      ? getColorClasses(item.color, true)
                      : getColorClasses(item.color, false)
                  } ${
                    item.requireAuth && !isConnected 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'cursor-pointer'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs opacity-70">{item.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Account Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 uppercase tracking-wide">
              👤 Tài khoản
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {categorizeItems('account').map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item)}
                  disabled={item.requireAuth && !isConnected}
                  className={`flex items-center p-3 rounded-lg border-2 transition-all duration-200 text-left w-full ${
                    isActivePath(item.href)
                      ? getColorClasses(item.color, true)
                      : getColorClasses(item.color, false)
                  } ${
                    item.requireAuth && !isConnected 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'cursor-pointer'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs opacity-70">{item.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Connection Status */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center text-sm">
              <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-gray-600">
                {isConnected ? 'Đã kết nối ví' : 'Chưa kết nối ví'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
