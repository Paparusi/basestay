'use client'

import React, { useState, lazy, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { 
  MagnifyingGlassIcon, 
  ShieldCheckIcon,
  MapPinIcon,
  HeartIcon,
  ArrowRightIcon,
  GlobeAltIcon,
  BanknotesIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

// Dynamic imports with loading states
const FeaturedProperties = dynamic(() => import('@/components/home/FeaturedProperties'), {
  loading: () => (
    <div className="animate-pulse bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  ),
  ssr: false
})

const TrustedBySection = dynamic(() => import('@/components/home/TrustedBySection'), {
  loading: () => (
    <div className="animate-pulse bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-6 bg-gray-200 rounded w-1/4 mx-auto mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  ),
  ssr: false
})

// Memoized components
const SearchSection = React.memo(({ 
  searchLocation, 
  setSearchLocation, 
  checkIn, 
  setCheckIn, 
  checkOut, 
  setCheckOut, 
  guests, 
  setGuests, 
  handleSearch 
}: any) => (
  <section className="relative bg-gradient-to-br from-blue-600 to-purple-700 py-20 overflow-hidden">
    {/* Background Pattern */}
    <div className="absolute inset-0 opacity-10">
      <div className="grid grid-cols-20 gap-1 h-full">
        {[...Array(400)].map((_, i) => (
          <div key={i} className="bg-white/20 rounded-sm"></div>
        ))}
      </div>
    </div>
    
    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
          <span className="text-3xl font-bold text-white">₿S</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Book with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">USDC</span><br />
          Stay with <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-white">Confidence</span>
        </h1>
        
        <p className="text-xl text-blue-100 mb-2 max-w-2xl mx-auto">
          The first <span className="font-semibold text-white">decentralized</span> booking platform built on <span className="font-semibold text-white">Base blockchain</span>.
        </p>
        
        <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm">
          <div className="flex items-center space-x-2 text-green-300">
            <GlobeAltIcon className="h-4 w-4" />
            <span>Base Mainnet</span>
          </div>
          <div className="flex items-center space-x-2 text-blue-300">
            <BanknotesIcon className="h-4 w-4" />
            <span>USDC Payments</span>
          </div>
          <div className="flex items-center space-x-2 text-purple-300">
            <ShieldCheckIcon className="h-4 w-4" />
            <span>Smart Contracts</span>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Where</label>
            <input
              type="text"
              placeholder="Search destinations"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Check In</label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Check Out</label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Guests</label>
            <select
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num}>{num} guest{num > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
        </div>
        
        <button
          onClick={handleSearch}
          className="w-full md:w-auto mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <MagnifyingGlassIcon className="h-5 w-5 inline mr-2" />
          Search
        </button>
        
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {['Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Nha Trang'].map(city => (
            <button
              key={city}
              onClick={() => setSearchLocation(city)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-700 transition-colors"
            >
              {city}
            </button>
          ))}
        </div>
      </div>
    </div>
  </section>
))

SearchSection.displayName = 'SearchSection'

export default function HomePage() {
  const router = useRouter()
  const [searchLocation, setSearchLocation] = useState('')
  const [guests, setGuests] = useState(1)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')

  const handleSearch = () => {
    const params = new URLSearchParams({
      location: searchLocation,
      guests: guests.toString(),
      checkIn: checkIn || '',
      checkOut: checkOut || ''
    })
    router.push(`/properties?${params}`)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Search */}
      <SearchSection 
        searchLocation={searchLocation}
        setSearchLocation={setSearchLocation}
        checkIn={checkIn}
        setCheckIn={setCheckIn}
        checkOut={checkOut}
        setCheckOut={setCheckOut}
        guests={guests}
        setGuests={setGuests}
        handleSearch={handleSearch}
      />

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose BaseStay?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the future of travel with blockchain-powered bookings, transparent pricing, and secure USDC payments
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheckIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Secure & Transparent</h3>
              <p className="text-gray-600">
                All transactions are secured by smart contracts on Base blockchain. No hidden fees, complete transparency.
              </p>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BanknotesIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">USDC Payments</h3>
              <p className="text-gray-600">
                Pay and receive in stable USDC cryptocurrency. Fast, low-cost transactions on Base L2 network.
              </p>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ClockIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Instant Booking</h3>
              <p className="text-gray-600">
                Book instantly with smart contracts. No waiting for approval, automatic confirmation and payment processing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties - Lazy Loaded */}
      <FeaturedProperties />

      {/* Trusted By Section - Lazy Loaded */}
      <TrustedBySection />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of travelers and hosts who trust BaseStay for secure, transparent bookings
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <Link
              href="/properties"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center space-x-2 shadow-lg"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
              <span>Explore Properties</span>
            </Link>
            <Link
              href="/host"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors flex items-center space-x-2"
            >
              <span>Become a Host</span>
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">₿S</span>
                </div>
                <span className="text-xl font-bold">BaseStay</span>
              </div>
              <p className="text-gray-400 mb-4">
                The first decentralized booking platform on Base blockchain.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Platform</h3>
              <ul className="space-y-2">
                <li><Link href="/properties" className="text-gray-400 hover:text-white transition-colors">Properties</Link></li>
                <li><Link href="/host" className="text-gray-400 hover:text-white transition-colors">Become a Host</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 BaseStay. All rights reserved. Built on Base L2.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
