'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
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
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { ConnectWalletButton } from '@/components/web3/ConnectWalletButton'

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

  const featuredProperties = [
    {
      id: 1,
      title: "Luxury Downtown Apartment",
      location: "Ho Chi Minh City",
      price: 75,
      rating: 4.9,
      reviews: 128,
      image: "/images/placeholder.svg",
      host: "Verified Host",
      isWishlisted: false
    },
    {
      id: 2,
      title: "Modern Studio with City View",
      location: "Ha Noi",
      price: 45,
      rating: 4.8,
      reviews: 89,
      image: "/images/placeholder.svg",
      host: "Superhost",
      isWishlisted: true
    },
    {
      id: 3,
      title: "Cozy Beachfront Villa",
      location: "Da Nang",
      price: 120,
      rating: 4.9,
      reviews: 203,
      image: "/images/placeholder.svg",
      host: "Verified Host",
      isWishlisted: false
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                {/* Blockchain Grid Background */}
                <div className="absolute inset-0 opacity-20">
                  <div className="grid grid-cols-4 gap-px h-full">
                    {[...Array(16)].map((_, i) => (
                      <div key={i} className="bg-white/40"></div>
                    ))}
                  </div>
                </div>
                {/* House + Chain Icon */}
                <div className="relative z-10 flex items-center justify-center">
                  <div className="text-white text-lg font-bold">₿S</div>
                </div>
                {/* Connection Dots */}
                <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-blue-300 rounded-full"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  BaseStay
                </span>
                <span className="text-xs text-gray-500 font-medium">Web3 • Base L2</span>
              </div>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/properties" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Explore
              </Link>
              <Link href="/host" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Become a Host
              </Link>
              <div className="flex items-center space-x-3">
                <ConnectWalletButton />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Main Heading */}
          <div className="mb-16">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden">
                  {/* Blockchain Grid Background */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="grid grid-cols-6 gap-px h-full">
                      {[...Array(36)].map((_, i) => (
                        <div key={i} className="bg-white/30 animate-pulse" style={{animationDelay: `${i * 50}ms`}}></div>
                      ))}
                    </div>
                  </div>
                  {/* Central Logo */}
                  <div className="relative z-10 text-white text-2xl font-bold">₿S</div>
                  {/* Connecting Lines */}
                  <div className="absolute inset-0">
                    <div className="absolute top-2 right-2 w-3 h-3 border-2 border-green-400 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-2 left-2 w-2 h-2 border border-blue-300 rounded-full"></div>
                    <div className="absolute top-1/2 left-0 w-1 h-6 bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
                    <div className="absolute top-0 left-1/2 w-6 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                  </div>
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-xl -z-10"></div>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-8 text-gray-900">
              Book with <span className="text-blue-600">USDC</span>
              <br />
              Stay with <span className="text-green-600">Confidence</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              The first <span className="font-semibold text-purple-600">decentralized</span> booking platform built on <span className="font-semibold text-blue-600">Base blockchain</span>.
            </p>
            <div className="flex justify-center items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Base Mainnet</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>USDC Payments</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Smart Contracts</span>
              </div>
            </div>
          </div>

          {/* Search Box */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Location */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Where</label>
                  <input
                    type="text"
                    placeholder="Search destinations"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Check In */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Check In</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Check Out */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Check Out</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Guests & Search */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Guests</label>
                  <div className="flex">
                    <select
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value))}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <option key={num} value={num}>
                          {num} guest{num > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleSearch}
                      className="px-6 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Search */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {['Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Nha Trang'].map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    setSearchLocation(city)
                    handleSearch()
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-700 transition-colors"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Simple Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">10K+</div>
              <div className="text-sm text-gray-600">Properties</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">50K+</div>
              <div className="text-sm text-gray-600">Happy Guests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">99.9%</div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose BaseStay */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Why Choose BaseStay?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the future of travel booking with blockchain technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <BanknotesIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Low Fees</h3>
              <p className="text-gray-600 leading-relaxed">
                Only 2.5% platform fee vs 14-16% on traditional platforms. More money stays with hosts and guests save more.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <ClockIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Instant Payments</h3>
              <p className="text-gray-600 leading-relaxed">
                USDC payments settled instantly on Base L2. No waiting periods, no chargebacks, instant confirmation.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheckIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Transparent</h3>
              <p className="text-gray-600 leading-relaxed">
                All bookings and reviews stored immutably on blockchain. Complete transparency and trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Featured Properties
              </h2>
              <p className="text-lg text-gray-600">Discover amazing places verified on blockchain</p>
            </div>
            <Link 
              href="/properties" 
              className="hidden md:flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <span>View All</span>
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map((property) => (
              <div key={property.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-gray-200">
                <div className="relative h-64">
                  <Image
                    src={property.image}
                    alt={property.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <button className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
                      <HeartIcon className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {property.host}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {property.title}
                      </h3>
                      <p className="text-gray-600 flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        {property.location}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <StarSolidIcon className="h-5 w-5 text-yellow-400" />
                      <span className="font-semibold text-gray-900">{property.rating}</span>
                      <span className="text-gray-500 text-sm">({property.reviews})</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-gray-900">${property.price}</span>
                      <span className="text-gray-600">USDC/night</span>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 md:hidden">
            <Link 
              href="/properties" 
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <span>View All Properties</span>
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
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
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
              <span>Explore Properties</span>
            </Link>
            <Link
              href="/host"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors flex items-center space-x-2"
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
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                  {/* Blockchain Grid Background */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="grid grid-cols-4 gap-px h-full">
                      {[...Array(16)].map((_, i) => (
                        <div key={i} className="bg-white/40"></div>
                      ))}
                    </div>
                  </div>
                  {/* Main Logo */}
                  <div className="relative z-10 flex items-center justify-center">
                    <div className="text-white text-lg font-bold">₿S</div>
                  </div>
                  {/* Connection Indicators */}
                  <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-blue-300 rounded-full"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-white">BaseStay</span>
                  <span className="text-xs text-gray-400">Web3 Booking Platform</span>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                The future of decentralized travel booking on Base blockchain.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <GlobeAltIcon className="h-4 w-4" />
                </div>
                <div className="flex items-center space-x-2 bg-blue-600/20 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-blue-400 font-medium">Base Mainnet</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/properties" className="hover:text-white transition-colors">Explore</Link></li>
                <li><Link href="/host" className="hover:text-white transition-colors">Become a Host</Link></li>
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/press" className="hover:text-white transition-colors">Press</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">&copy; 2025 BaseStay. All rights reserved.</p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-gray-400">Powered by</span>
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">Base L2</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
