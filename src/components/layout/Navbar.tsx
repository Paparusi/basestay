'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAccount } from 'wagmi'
import { 
  HomeIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  HeartIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { ConnectWalletButton } from '@/components/web3/ConnectWalletButton'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const pathname = usePathname()

  const navigationItems = [
    {
      name: 'Trang chủ',
      href: '/',
      icon: HomeIcon,
      description: 'Khám phá các chỗ ở'
    },
    {
      name: 'Tìm kiếm',
      href: '/search',
      icon: MagnifyingGlassIcon,
      description: 'Tìm chỗ ở phù hợp'
    },
    {
      name: 'Yêu thích',
      href: '/favorites',
      icon: HeartIcon,
      description: 'Danh sách yêu thích',
      requireAuth: true
    }
  ]

  const hostItems = [
    {
      name: 'Đăng chỗ ở',
      href: '/host/properties/new',
      icon: PlusCircleIcon,
      description: 'Cho thuê chỗ ở',
      requireAuth: true,
      highlight: true
    },
    {
      name: 'Quản lý',
      href: '/host/dashboard',
      icon: ChartBarIcon,
      description: 'Dashboard cho chủ nhà',
      requireAuth: true
    },
    {
      name: 'Thu nhập',
      href: '/host/earnings',
      icon: CurrencyDollarIcon,
      description: 'Xem thu nhập',
      requireAuth: true
    }
  ]

  const isActivePath = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const handleNavigation = (href: string, requireAuth?: boolean) => {
    if (requireAuth && !isConnected) {
      alert('Vui lòng kết nối ví để truy cập tính năng này!')
      return
    }
    router.push(href)
    setIsMenuOpen(false)
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">BaseStay</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Main Navigation */}
            {navigationItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href, item.requireAuth)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActivePath(item.href)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                }`}
                title={item.description}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.name}
              </button>
            ))}

            {/* Divider */}
            <div className="h-6 border-l border-gray-300"></div>

            {/* Host Navigation */}
            {hostItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href, item.requireAuth)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  item.highlight
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : isActivePath(item.href)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                }`}
                title={item.description}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.name}
              </button>
            ))}

            {/* Wallet Connection */}
            <ConnectWalletButton />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Main Navigation Mobile */}
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide px-3 py-2">
              Khám phá
            </div>
            {navigationItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href, item.requireAuth)}
                className={`w-full flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActivePath(item.href)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div>{item.name}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              </button>
            ))}

            {/* Host Navigation Mobile */}
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide px-3 py-2 mt-4">
              Cho thuê
            </div>
            {hostItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href, item.requireAuth)}
                className={`w-full flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  item.highlight
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : isActivePath(item.href)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div>{item.name}</div>
                  <div className={`text-xs ${item.highlight ? 'text-green-200' : 'text-gray-500'}`}>
                    {item.description}
                  </div>
                </div>
              </button>
            ))}

            {/* Mobile Wallet Connection */}
            <div className="px-3 py-4 border-t border-gray-200 mt-4">
              <ConnectWalletButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
