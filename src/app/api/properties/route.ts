import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createPropertySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  location: z.string().min(1, 'Location is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  pricePerNight: z.number().positive('Price must be positive'),
  maxGuests: z.number().min(1, 'Must accommodate at least 1 guest'),
  bedrooms: z.number().min(1, 'Must have at least 1 bedroom'),
  bathrooms: z.number().min(1, 'Must have at least 1 bathroom'),
  propertyType: z.string().min(1, 'Property type is required'),
  amenities: z.array(z.string()),
  images: z.array(z.string()),
  rules: z.string().optional(),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  ownerAddress: z.string().min(1, 'Owner address is required')
})

// GET - Get properties for a host
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerAddress = searchParams.get('ownerAddress')
    
    if (!ownerAddress) {
      return NextResponse.json(
        { error: 'Owner address is required' },
        { status: 400 }
      )
    }

    const properties = await prisma.property.findMany({
      where: {
        ownerAddress: ownerAddress.toLowerCase()
      },
      include: {
        bookings: {
          select: {
            id: true,
            status: true,
            totalPrice: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate stats for each property
    const propertiesWithStats = properties.map((property: { bookings: { totalPrice: string | number }[]; reviews: { rating: number }[]; [key: string]: unknown }) => {
      const totalBookings = property.bookings.length
      const totalEarnings = property.bookings.reduce(
        (sum: number, booking: { totalPrice: string | number }) => sum + Number(booking.totalPrice), 
        0
      )
      const avgRating = property.reviews.length > 0 
        ? property.reviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0) / property.reviews.length
        : 0

      return {
        ...property,
        stats: {
          totalBookings,
          totalEarnings,
          averageRating: Math.round(avgRating * 10) / 10
        }
      }
    })

    return NextResponse.json({
      success: true,
      properties: propertiesWithStats
    })

  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    )
  }
}

// POST - Create new property
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('Received property data:', JSON.stringify(body, null, 2))
    
    // Validate input
    const validatedData = createPropertySchema.parse(body)
    
    console.log('Validated data:', JSON.stringify(validatedData, null, 2))
    
    // Ensure user exists
    await prisma.user.upsert({
      where: {
        walletAddress: validatedData.ownerAddress.toLowerCase()
      },
      update: {
        isHost: true,
        updatedAt: new Date()
      },
      create: {
        walletAddress: validatedData.ownerAddress.toLowerCase(),
        isHost: true
      }
    })

    // Generate a temporary tokenId (in production, this would come from blockchain)
    const tokenId = Math.floor(Math.random() * 1000000)

    // Create property
    const property = await prisma.property.create({
      data: {
        ...validatedData,
        tokenId,
        ownerAddress: validatedData.ownerAddress.toLowerCase(),
        pricePerNight: validatedData.pricePerNight,
        amenities: validatedData.amenities,
        images: validatedData.images
      }
    })

    return NextResponse.json({
      success: true,
      property
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors)
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating property:', error)
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    )
  }
}
