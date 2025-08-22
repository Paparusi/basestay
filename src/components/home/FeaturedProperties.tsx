import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { HeartIcon } from '@heroicons/react/24/outline'

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
    title: "Cozy Beach Villa",
    location: "Da Nang",
    price: 120,
    rating: 4.8,
    reviews: 89,
    image: "/images/placeholder.svg",
    host: "Superhost",
    isWishlisted: true
  },
  {
    id: 3,
    title: "Modern Studio",
    location: "Hanoi",
    price: 50,
    rating: 4.7,
    reviews: 45,
    image: "/images/placeholder.svg",
    host: "New Host",
    isWishlisted: false
  }
]

export default function FeaturedProperties() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Properties</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover unique places to stay, verified by our community and secured on Base blockchain
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featuredProperties.map((property) => (
          <div 
            key={property.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="relative h-64">
              <Image
                src={property.image}
                alt={property.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={property.id <= 3}
              />
              <button className="absolute top-4 right-4 p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-colors">
                <HeartIcon className={`h-5 w-5 ${property.isWishlisted ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
              </button>
              <div className="absolute bottom-4 left-4">
                <span className="bg-white/90 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                  {property.host}
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                  {property.title}
                </h3>
                <div className="flex items-center ml-2">
                  <StarSolidIcon className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium text-gray-700 ml-1">
                    {property.rating}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 mb-4 flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {property.location}
              </p>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-gray-900">${property.price}</span>
                  <span className="text-gray-600">/night</span>
                </div>
                <Link
                  href={`/properties/${property.id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  View Details
                </Link>
              </div>

              <div className="mt-3 text-sm text-gray-500">
                {property.reviews} reviews
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <Link
          href="/properties"
          className="inline-flex items-center bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          View All Properties
          <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  )
}
