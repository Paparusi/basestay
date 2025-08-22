import React from 'react'
import Image from 'next/image'

export default function TrustedBySection() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Trusted by the Community</h2>
          <p className="text-gray-600">
            Join thousands of hosts and guests who trust BaseStay for secure, decentralized bookings
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
            <div className="text-gray-600 font-medium">Properties</div>
            <div className="text-sm text-gray-500 mt-1">Listed worldwide</div>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="text-4xl font-bold text-green-600 mb-2">50K+</div>
            <div className="text-gray-600 font-medium">Happy Guests</div>
            <div className="text-sm text-gray-500 mt-1">Successful bookings</div>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="text-4xl font-bold text-purple-600 mb-2">99.9%</div>
            <div className="text-gray-600 font-medium">Uptime</div>
            <div className="text-sm text-gray-500 mt-1">Reliable platform</div>
          </div>
        </div>

        <div className="mt-16">
          <h3 className="text-center text-lg font-semibold text-gray-700 mb-8">
            Powered by trusted Web3 technology
          </h3>
          
          <div className="flex justify-center items-center space-x-12 opacity-60">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-gray-600 font-medium">Base</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">CB</span>
              </div>
              <span className="text-gray-600 font-medium">Coinbase</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">$</span>
              </div>
              <span className="text-gray-600 font-medium">USDC</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
