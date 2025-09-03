'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAccount } from 'wagmi'
import { 
  HomeIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  Bars3Icon,
  XMarkIcon,
  HeartIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'
import { ConnectWalletButton } from '@/components/web3/ConnectWalletButton'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const pathname = usePathname()

  const mainNavigation = [
    {
      name: 'Explore',
      href: '/search',
      icon: MagnifyingGlassIcon
    },
    {
      name: 'Wishlist',
      href: '/favorites',
      icon: HeartIcon,
      requireAuth: true
    }
  ]

  const isActivePath = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const handleNavigation = (href: string, requireAuth?: boolean) => {
    if (requireAuth && !isConnected) {
      alert('Please connect your wallet to access this feature!')
      return
    }
    router.push(href)
    setIsMenuOpen(false)
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-bold text-gray-900">BaseStay</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {/* Main Navigation */}
            <nav className="flex items-center space-x-1">
              {mainNavigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href, item.requireAuth)}
                  className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActivePath(item.href)
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.name}
                </button>
              ))}
            </nav>

            {/* Host Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleNavigation('/host/properties/new', true)}
                className="text-sm font-medium text-gray-900 hover:text-gray-700 px-4 py-2 rounded-full hover:bg-gray-50 transition-all duration-200"
              >
                Become a Host
              </button>
              
              {isConnected && (
                <button
                  onClick={() => handleNavigation('/host/dashboard', true)}
                  className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 rounded-full hover:bg-gray-50 transition-all duration-200"
                >
                  <UserCircleIcon className="h-4 w-4 mr-2" />
                  Dashboard
                </button>
              )}
            </div>

            {/* Wallet Connection */}
            <div className="flex items-center">
              <ConnectWalletButton />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
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
        <div className="lg:hidden bg-white border-t border-gray-100">
          <div className="px-4 py-6 space-y-6">
            {/* Main Navigation Mobile */}
            <div className="space-y-2">
              {mainNavigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href, item.requireAuth)}
                  className={`w-full flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                    isActivePath(item.href)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </button>
              ))}
            </div>

            {/* Host Actions Mobile */}
            <div className="border-t border-gray-100 pt-6 space-y-2">
              <button
                onClick={() => handleNavigation('/host/properties/new', true)}
                className="w-full flex items-center px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
              >
                <PlusCircleIcon className="h-5 w-5 mr-3" />
                Become a Host
              </button>
              
              {isConnected && (
                <button
                  onClick={() => handleNavigation('/host/dashboard', true)}
                  className="w-full flex items-center px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
                >
                  <UserCircleIcon className="h-5 w-5 mr-3" />
                  Dashboard
                </button>
              )}
            </div>

            {/* Mobile Wallet Connection */}
            <div className="border-t border-gray-100 pt-6">
              <ConnectWalletButton />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
