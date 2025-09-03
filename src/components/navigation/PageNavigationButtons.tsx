'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import {
  HomeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ChartBarIcon,
  HeartIcon,
  UserCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

interface PageNavButtonsProps {
  showBackButton?: boolean
  showHomeButton?: boolean
  customButtons?: Array<{
    name: string
    href: string
    icon?: React.ComponentType<{ className?: string }>
    variant?: 'primary' | 'secondary' | 'success' | 'warning'
    requireAuth?: boolean
  }>
  className?: string
}

export default function PageNavigationButtons({
  showBackButton = true,
  showHomeButton = true,
  customButtons = [],
  className = ''
}: PageNavButtonsProps) {
  const router = useRouter()
  const { isConnected } = useAccount()

  const defaultButtons = [
    {
      name: 'Tìm kiếm',
      href: '/search',
      icon: MagnifyingGlassIcon,
      variant: 'secondary' as const
    },
    {
      name: 'Đăng chỗ ở',
      href: '/host/properties/new',
      icon: PlusIcon,
      variant: 'success' as const,
      requireAuth: true
    },
    {
      name: 'Dashboard',
      href: '/host/dashboard',
      icon: ChartBarIcon,
      variant: 'primary' as const,
      requireAuth: true
    },
    {
      name: 'Yêu thích',
      href: '/favorites',
      icon: HeartIcon,
      variant: 'warning' as const,
      requireAuth: true
    }
  ]

  const allButtons = [...customButtons, ...defaultButtons]

  const getButtonStyles = (variant: string) => {
    const baseStyles = 'inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md transition-all duration-200'
    
    const variants = {
      primary: 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700',
      secondary: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400',
      success: 'border-green-600 bg-green-600 text-white hover:bg-green-700 hover:border-green-700',
      warning: 'border-yellow-500 bg-yellow-500 text-white hover:bg-yellow-600 hover:border-yellow-600'
    }
    
    return `${baseStyles} ${variants[variant as keyof typeof variants] || variants.secondary}`
  }

  const handleNavigation = (href: string, requireAuth?: boolean) => {
    if (requireAuth && !isConnected) {
      alert('Vui lòng kết nối ví để truy cập tính năng này!')
      return
    }
    router.push(href)
  }

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {/* Back Button */}
      {showBackButton && (
        <button
          onClick={handleGoBack}
          className="inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
          title="Quay lại trang trước"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Quay lại
        </button>
      )}

      {/* Home Button */}
      {showHomeButton && (
        <Link
          href="/"
          className="inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
          title="Về trang chủ"
        >
          <HomeIcon className="h-4 w-4 mr-2" />
          Trang chủ
        </Link>
      )}

      {/* Navigation Buttons */}
      {allButtons.map((button, index) => {
        const IconComponent = button.icon
        const disabled = button.requireAuth && !isConnected

        return (
          <button
            key={`${button.name}-${index}`}
            onClick={() => handleNavigation(button.href, button.requireAuth)}
            disabled={disabled}
            className={`${getButtonStyles(button.variant || 'secondary')} ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
            title={disabled ? 'Cần kết nối ví để sử dụng' : button.name}
          >
            {IconComponent && <IconComponent className="h-4 w-4 mr-2" />}
            {button.name}
            {button.requireAuth && !isConnected && (
              <span className="ml-1 text-xs">🔒</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// Quick Action Buttons for specific contexts
export function GuestNavigationButtons({ className }: { className?: string }) {
  return (
    <PageNavigationButtons
      customButtons={[
        {
          name: 'Tìm kiếm chỗ ở',
          href: '/search',
          icon: MagnifyingGlassIcon,
          variant: 'primary'
        },
        {
          name: 'Yêu thích',
          href: '/favorites',
          icon: HeartIcon,
          variant: 'warning',
          requireAuth: true
        }
      ]}
      className={className}
    />
  )
}

export function HostNavigationButtons({ className }: { className?: string }) {
  return (
    <PageNavigationButtons
      customButtons={[
        {
          name: 'Đăng chỗ ở mới',
          href: '/host/properties/new',
          icon: PlusIcon,
          variant: 'success',
          requireAuth: true
        },
        {
          name: 'Quản lý Dashboard',
          href: '/host/dashboard',
          icon: ChartBarIcon,
          variant: 'primary',
          requireAuth: true
        }
      ]}
      className={className}
    />
  )
}
