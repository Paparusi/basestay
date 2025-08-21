'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { 
  MagnifyingGlassIcon, 
  UserGroupIcon, 
  CalendarDaysIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  LockClosedIcon,
  CheckBadgeIcon,
  MapPinIcon,
  StarIcon,
  HeartIcon,
  ArrowRightIcon,
  PlayIcon,
  GlobeAltIcon,
  BanknotesIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { ConnectWalletButton } from '@/components/web3/ConnectWalletButton'

export default function ModernHomePage() {
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
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🏠</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  BaseStay
                </span>
                <span className="text-xs text-gray-500 font-medium">Powered by Base L2</span>
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
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Main Heading */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Book with 
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                USDC
              </span>
              <br />
              <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Stay with 
              </span>
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Confidence
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              The first decentralized booking platform built on Base blockchain.
              <br className="hidden md:block" />
              <span className="font-semibold text-blue-600">Instant payments</span>, 
              <span className="font-semibold text-green-600"> transparent reviews</span>, and 
              <span className="font-semibold text-purple-600"> global accessibility</span>.
            </p>
          </div>

          {/* Advanced Search Box */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-white rounded-3xl shadow-2xl p-4 border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Location */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPinIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder="Where are you going?"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-0 bg-gray-50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 placeholder-gray-500"
                  />
                  <label className="absolute -top-2 left-4 text-xs font-semibold text-gray-600 bg-white px-2 rounded">
                    Where
                  </label>
                </div>

                {/* Check In */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <CalendarDaysIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-0 bg-gray-50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-gray-900"
                  />
                  <label className="absolute -top-2 left-4 text-xs font-semibold text-gray-600 bg-white px-2 rounded">
                    Check In
                  </label>
                </div>

                {/* Check Out */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <CalendarDaysIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-0 bg-gray-50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-gray-900"
                  />
                  <label className="absolute -top-2 left-4 text-xs font-semibold text-gray-600 bg-white px-2 rounded">
                    Check Out
                  </label>
                </div>

                {/* Guests & Search */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserGroupIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    className="w-full pl-12 pr-4 py-4 border-0 bg-gray-50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 appearance-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <option key={num} value={num}>
                        {num} guest{num > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                  <label className="absolute -top-2 left-4 text-xs font-semibold text-gray-600 bg-white px-2 rounded">
                    Guests
                  </label>
                  <button
                    onClick={handleSearch}
                    className="absolute inset-y-0 right-0 mr-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl px-6 flex items-center hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <MagnifyingGlassIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Search Suggestions */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {['Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Nha Trang', 'Hoi An'].map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    setSearchLocation(city)
                    handleSearch()
                  }}
                  className="px-6 py-2 bg-white/60 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 hover:bg-white hover:shadow-md transition-all duration-200 border border-gray-200/50"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">10K+</div>
              <div className="text-sm text-gray-600 font-medium">Properties</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">50K+</div>
              <div className="text-sm text-gray-600 font-medium">Happy Guests</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">99.9%</div>
              <div className="text-sm text-gray-600 font-medium">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose BaseStay */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">BaseStay</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of travel booking with blockchain technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl hover:shadow-xl transition-all duration-300 border border-green-100/50">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <BanknotesIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Low Fees</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Only 2.5% platform fee vs 14-16% on traditional platforms. More money stays with hosts and guests save more.
              </p>
              <div className="flex items-center text-green-600 font-medium">
                <span>Save up to 85%</span>
                <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </div>

            <div className="group p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl hover:shadow-xl transition-all duration-300 border border-blue-100/50">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <ClockIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Instant Payments</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                USDC payments settled instantly on Base L2. No waiting periods, no chargebacks, instant confirmation.
              </p>
              <div className="flex items-center text-blue-600 font-medium">
                <span>Settlement in seconds</span>
                <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </div>

            <div className="group p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl hover:shadow-xl transition-all duration-300 border border-purple-100/50">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheckIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Transparent</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                All bookings and reviews stored immutably on blockchain. Complete transparency and trust.
              </p>
              <div className="flex items-center text-purple-600 font-medium">
                <span>100% verifiable</span>
                <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Featured <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Properties</span>
              </h2>
              <p className="text-xl text-gray-600">Discover amazing places verified on blockchain</p>
            </div>
            <Link 
              href="/properties" 
              className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
            >
              <span>View All</span>
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map((property) => (
              <div key={property.id} className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={property.image}
                    alt={property.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <button className={`p-2 rounded-full transition-colors ${
                      property.isWishlisted 
                        ? 'bg-red-500 text-white' 
                        : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
                    }`}>
                      <HeartIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {property.host}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
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
                      <span className="text-2xl font-bold text-gray-900">${property.price}</span>
                      <span className="text-gray-600">USDC/night</span>
                    </div>
                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105">
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
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-medium hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
            >
              <span>View All Properties</span>
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of travelers and hosts who trust BaseStay for secure, transparent bookings
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <Link
              href="/properties"
              className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 flex items-center space-x-2"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
              <span>Explore Properties</span>
            </Link>
            <Link
              href="/host"
              className="border-2 border-white text-white px-8 py-4 rounded-full font-bold hover:bg-white hover:text-blue-600 transition-all duration-200 transform hover:-translate-y-1 flex items-center space-x-2"
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
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                  <span className="text-xl">🏠</span>
                </div>
                <span className="text-2xl font-bold">BaseStay</span>
              </div>
              <p className="text-gray-400 mb-4">
                The future of decentralized travel booking on Base blockchain.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <GlobeAltIcon className="h-4 w-4" />
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
