/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buildSmartLocationQuery, getLocationSuggestions, parseLocationSearch } from '@/lib/locationUtils'

// Smart location matching function
function buildLocationQuery(searchTerm: string) {
  if (!searchTerm) return {}
  
  // Use the smart location utility
  return buildSmartLocationQuery(searchTerm)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Decode UTF-8 parameters properly
    const location = decodeURIComponent(searchParams.get('location') || '').trim()
    const guests = parseInt(searchParams.get('guests') || '1')
    const minPrice = parseFloat(searchParams.get('minPrice') || '0')
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999')
    const propertyType = searchParams.get('propertyType') || ''
    const bedrooms = parseInt(searchParams.get('bedrooms') || '0')
    const amenities = searchParams.get('amenities')?.split(',').filter(Boolean) || []
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    console.log('Search params:', { location, guests, minPrice, maxPrice, propertyType, bedrooms, sortBy })

    const skip = (page - 1) * limit

    // Build advanced search query
    const whereClause: any = {
      isActive: true,
      maxGuests: { gte: guests },
      pricePerNight: {
        gte: minPrice,
        lte: maxPrice
      }
    }

    // Smart location search
    if (location) {
      Object.assign(whereClause, buildLocationQuery(location))
    }

    // Property type filter
    if (propertyType) {
      whereClause.propertyType = propertyType
    }

    // Bedrooms filter
    if (bedrooms > 0) {
      whereClause.bedrooms = { gte: bedrooms }
    }

    // Amenities filter (if we add amenities field later)
    if (amenities.length > 0) {
      whereClause.amenities = {
        hasEvery: amenities
      }
    }

    // Smart sorting
    let orderBy: any = {}
    switch (sortBy) {
      case 'price':
        orderBy = { pricePerNight: sortOrder }
        break
      case 'rating':
        orderBy = [
          { reviews: { _count: 'desc' } }, // Properties with more reviews first
          { createdAt: 'desc' }
        ]
        break
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      case 'popular':
        orderBy = [
          { bookings: { _count: 'desc' } }, // Most booked first
          { reviews: { _count: 'desc' } }
        ]
        break
      default:
        orderBy = { createdAt: 'desc' }
    }

    // Get properties with advanced search
    const properties = await prisma.property.findMany({
      where: whereClause,
      include: {
        owner: {
          select: {
            id: true,
            displayName: true,
            avatar: true,
            isVerified: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        },
        bookings: {
          select: {
            id: true
          }
        }
      },
      orderBy,
      skip,
      take: limit
    })

    // Calculate enhanced metrics for each property
    const enrichedProperties = properties.map((property: any) => {
      const ratings = property.reviews.map((r: any) => r.rating)
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length 
        : 0

      // Calculate relevance score for location search
      let relevanceScore = 0
      if (location) {
        const locationAnalysis = parseLocationSearch(location)
        const propertyLocationAnalysis = parseLocationSearch(property.location)
        
        // City match bonus
        if (locationAnalysis.city && propertyLocationAnalysis.city &&
            locationAnalysis.city.toLowerCase() === propertyLocationAnalysis.city.toLowerCase()) {
          relevanceScore += 50
        }
        
        // District match bonus  
        if (locationAnalysis.district && propertyLocationAnalysis.district &&
            locationAnalysis.district.toLowerCase() === propertyLocationAnalysis.district.toLowerCase()) {
          relevanceScore += 30
        }
        
        // Keyword matches
        const searchWords = locationAnalysis.keywords
        const locationWords = propertyLocationAnalysis.keywords
        
        searchWords.forEach((searchWord: string) => {
          locationWords.forEach((locationWord: string) => {
            if (locationWord.includes(searchWord) || searchWord.includes(locationWord)) {
              relevanceScore += locationWord === searchWord ? 10 : 5
            }
          })
        })
        
        // Confidence bonus
        relevanceScore += locationAnalysis.confidence / 10
      }

      return {
        ...property,
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: ratings.length,
        bookingCount: property.bookings.length,
        relevanceScore,
        // Remove bookings from response for security
        bookings: undefined
      }
    })

    // Sort by relevance if location search is performed
    let finalProperties = enrichedProperties
    if (location && sortBy === 'createdAt') {
      finalProperties = enrichedProperties.sort((a: any, b: any) => {
        if (a.relevanceScore !== b.relevanceScore) {
          return b.relevanceScore - a.relevanceScore
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
    }

    const totalProperties = await prisma.property.count({
      where: whereClause
    })

    // Add search suggestions for no results
    let suggestions: string[] = []
    if (totalProperties === 0 && location) {
      // Use smart location suggestions
      suggestions = getLocationSuggestions(location)
      
      // If no smart suggestions, fallback to popular locations from database
      if (suggestions.length === 0) {
        const popularLocations = await prisma.property.groupBy({
          by: ['location'],
          where: { isActive: true },
          _count: true,
          orderBy: { _count: { location: 'desc' } },
          take: 5
        })
        
        suggestions = popularLocations.map((loc: any) => loc.location)
      }
    }

    return NextResponse.json({
      properties: finalProperties,
      pagination: {
        page,
        limit,
        total: totalProperties,
        pages: Math.ceil(totalProperties / limit)
      },
      suggestions,
      filters: {
        location: location || null,
        guests,
        minPrice,
        maxPrice,
        propertyType: propertyType || null,
        bedrooms: bedrooms || null,
        amenities,
        sortBy,
        sortOrder
      }
    })

  } catch (error) {
    console.error('Property search error:', error)
    return NextResponse.json(
      { error: 'Failed to search properties' },
      { status: 500 }
    )
  }
}
