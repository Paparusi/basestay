'use client'

import React, { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAccount } from 'wagmi'
import {
  HomeIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  ChartBarIcon,
  HeartIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'

interface QuickNavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  requireAuth?: boolean
}

export default function QuickNavigationPanel() {
  const [isExpanded, setIsExpanded] = useState(false)
  const { isConnected } = useAccount()
  const router = useRouter()
  const pathname = usePathname()

  const quickNavItems: QuickNavItem[] = [
    {
      name: 'Home',
      href: '/',
      icon: HomeIcon
    },
    {
      name: 'Search',
      href: '/search',
      icon: MagnifyingGlassIcon
    },
    {
      name: 'Wishlist',
      href: '/favorites',
      icon: HeartIcon,
      requireAuth: true
    },
    {
      name: 'Host',
      href: '/host/properties/new',
      icon: PlusCircleIcon,
      requireAuth: true
    },
    {
      name: 'Dashboard',
      href: '/host/dashboard',
      icon: ChartBarIcon,
      requireAuth: true
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: UserCircleIcon,
      requireAuth: true
    }
  ]

  const isActivePath = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const handleNavigation = (item: QuickNavItem) => {
    if (item.requireAuth && !isConnected) {
      alert('Please connect your wallet to access this feature!')
      return
    }
    router.push(item.href)
    setIsExpanded(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Navigation Panel */}
      {isExpanded && (
        <div className="mb-4 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-4">
            <div className="grid grid-cols-2 gap-2 w-48">
              {quickNavItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item)}
                  disabled={item.requireAuth && !isConnected}
                  className={`flex flex-col items-center p-3 rounded-xl transition-all duration-200 ${
                    isActivePath(item.href)
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-gray-50 text-gray-600'
                  } ${
                    item.requireAuth && !isConnected 
                      ? 'opacity-40 cursor-not-allowed' 
                      : 'cursor-pointer hover:scale-105'
                  }`}
                >
                  <item.icon className="h-5 w-5 mb-1" />
                  <span className="text-xs font-medium">{item.name}</span>
                  {item.requireAuth && !isConnected && (
                    <div className="w-1 h-1 bg-red-400 rounded-full mt-1"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center ${
          isExpanded ? 'rotate-180' : ''
        }`}
        title={isExpanded ? 'Close menu' : 'Quick navigation'}
      >
        {isExpanded ? (
          <ArrowDownIcon className="h-6 w-6" />
        ) : (
          <ArrowUpIcon className="h-6 w-6" />
        )}
      </button>
    </div>
  )
}
