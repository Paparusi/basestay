'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { 
  ChevronRightIcon, 
  HomeIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

interface BreadcrumbItem {
  name: string
  href: string
  current?: boolean
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  showBackButton?: boolean
  className?: string
}

const pathNameMap: Record<string, string> = {
  '/': 'Home',
  '/search': 'Search',
  '/favorites': 'Wishlist',
  '/profile': 'Profile',
  '/settings': 'Settings',
  '/host': 'Host',
  '/host/dashboard': 'Dashboard',
  '/host/properties': 'Properties',
  '/host/properties/new': 'List Property',
  '/host/earnings': 'Earnings',
  '/host/bookings': 'Bookings',
  '/host/reviews': 'Reviews',
  '/properties': 'Properties',
  '/bookings': 'My Bookings',
  '/trips': 'My Trips',
}

export default function Breadcrumb({ 
  items, 
  showBackButton = true, 
  className = '' 
}: BreadcrumbProps) {
  const router = useRouter()
  const pathname = usePathname()

  const generateBreadcrumbItems = (): BreadcrumbItem[] => {
    if (items) return items

    const segments = pathname.split('/').filter(segment => segment !== '')
    
    if (segments.length === 0) {
      return [{ name: 'Home', href: '/', current: true }]
    }

    const breadcrumbItems: BreadcrumbItem[] = [
      { name: 'Home', href: '/' }
    ]

    let currentPath = ''
    
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const isLast = index === segments.length - 1
      
      // Check if it's a dynamic route (like [id])
      if (segment.match(/^[a-f0-9]{20,}$|^clk|^clu/)) {
        // Skip ID segments in breadcrumb display
        return
      }
      
      const name = pathNameMap[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1)
      
      breadcrumbItems.push({
        name,
        href: currentPath,
        current: isLast
      })
    })

    return breadcrumbItems
  }

  const breadcrumbItems = generateBreadcrumbItems()

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  return (
    <div className={`flex items-center justify-between py-2 ${className}`}>
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          {breadcrumbItems.map((item, index) => (
            <li key={item.href} className="flex items-center">
              {index === 0 && (
                <HomeIcon className="h-4 w-4 text-gray-400 mr-1" />
              )}
              
              {index > 0 && (
                <ChevronRightIcon 
                  className="h-4 w-4 text-gray-300 mx-2" 
                  aria-hidden="true" 
                />
              )}
              
              {item.current ? (
                <span className="text-sm font-medium text-gray-900">
                  {item.name}
                </span>
              ) : (
                <Link 
                  href={item.href}
                  className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {showBackButton && breadcrumbItems.length > 1 && (
        <button
          onClick={handleGoBack}
          className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors px-3 py-1 rounded-lg hover:bg-gray-50"
          title="Go back"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back
        </button>
      )}
    </div>
  )
}
