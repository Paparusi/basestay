'use client'

import React, { useState } from 'react'
import { 
  Page, 
  Navbar, 
  Card, 
  Button, 
  List, 
  ListItem
} from 'konsta/react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import {
  MagnifyingGlassIcon,
  HeartIcon,
  PlusIcon,
  UserIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'

export default function MobileHomePage() {
  const router = useRouter()
  const { isConnected } = useAccount()
  const [searchLocation, setSearchLocation] = useState('')

  const featuredProperties = [
    {
      id: '1',
      title: 'Luxury Villa in Da Nang',
      location: 'Da Nang, Vietnam',
      price: '$120/night',
      rating: '⭐ 4.8'
    },
    {
      id: '2', 
      title: 'Beachfront Apartment',
      location: 'Nha Trang, Vietnam',
      price: '$85/night',
      rating: '⭐ 4.6'
    }
  ]

  const handleSearch = () => {
    if (searchLocation.trim()) {
      router.push(`/search?location=${encodeURIComponent(searchLocation)}`)
    } else {
      router.push('/search')
    }
  }

  return (
    <Page>
      <Navbar 
        title="BaseStay"
        subtitle="Book with USDC on Base"
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white p-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
            <span className="text-2xl font-bold">₿S</span>
          </div>
          
          <h1 className="text-2xl font-bold mb-2">
            Book with <span className="text-yellow-300">USDC</span>
          </h1>
          <p className="text-blue-100 text-sm">
            Decentralized booking platform on Base blockchain
          </p>
        </div>

        {/* Search Card */}
        <Card className="bg-white/95 backdrop-blur-sm text-gray-900">
          <div className="p-4 space-y-4">
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Where do you want to stay?"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <Button 
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"
              onClick={handleSearch}
            >
              <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
              Search Properties
            </Button>
          </div>
        </Card>
      </div>

      {/* Featured Properties */}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-3">Featured Properties</h3>
        <List>
          {featuredProperties.map((property) => (
            <ListItem
              key={property.id}
              title={property.title}
              subtitle={property.location}
              text={`${property.price} • ${property.rating}`}
              media={
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🏠</span>
                </div>
              }
              link
              onClick={() => router.push(`/properties/${property.id}`)}
            />
          ))}
        </List>
      </div>

      {/* Connect Wallet CTA */}
      {!isConnected && (
        <div className="p-4">
          <Card className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
            <div className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
              <p className="text-green-100 text-sm mb-4">
                Start booking with USDC on Base blockchain
              </p>
              <Button 
                className="bg-white text-green-600 font-semibold px-6 py-2 rounded-lg"
                onClick={() => router.push('/')}
              >
                Connect Wallet
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Simple Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <button 
            onClick={() => router.push('/')}
            className="flex flex-col items-center py-2 text-blue-600"
          >
            <MagnifyingGlassIcon className="h-6 w-6 mb-1" />
            <span className="text-xs">Explore</span>
          </button>
          
          <button 
            onClick={() => router.push('/favorites')}
            className="flex flex-col items-center py-2 text-gray-600"
          >
            <HeartIcon className="h-6 w-6 mb-1" />
            <span className="text-xs">Wishlist</span>
          </button>
          
          <button 
            onClick={() => router.push('/host/properties/new')}
            className="flex flex-col items-center py-2 text-gray-600"
          >
            <PlusIcon className="h-6 w-6 mb-1" />
            <span className="text-xs">Host</span>
          </button>
          
          <button 
            onClick={() => router.push('/profile')}
            className="flex flex-col items-center py-2 text-gray-600"
          >
            <UserIcon className="h-6 w-6 mb-1" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>

      {/* Bottom padding for fixed tabbar */}
      <div className="h-20"></div>
    </Page>
  )
}
