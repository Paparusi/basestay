import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const owner = searchParams.get('owner')

    if (!owner) {
      return NextResponse.json({ error: 'Owner address required' }, { status: 400 })
    }

    const properties = await prisma.property.findMany({
      where: {
        ownerAddress: owner.toLowerCase()
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        bookings: {
          where: {
            status: {
              in: ['CONFIRMED', 'CHECKED_OUT']
            }
          }
        },
        reviews: true
      }
    })

    // Transform data to include computed fields
    const transformedProperties = properties.map(property => {
      const totalBookings = property.bookings?.length || 0
      const totalReviews = property.reviews?.length || 0
      const averageRating = totalReviews > 0 
        ? property.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / totalReviews 
        : 0
      
      return {
        id: property.id,
        title: property.title,
        location: property.location,
        pricePerNight: property.pricePerNight,
        isActive: property.isActive,
        images: property.images as string[] || [],
        views: 0, // Will implement view tracking later
        bookings: totalBookings,
        rating: averageRating,
        reviewCount: totalReviews,
        bstStaked: 1000, // Will implement BST staking tracking
        totalEarnings: property.bookings?.reduce((sum: number, booking: any) => sum + (booking.totalPrice || 0), 0) || 0,
        createdAt: property.createdAt.toISOString()
      }
    })

    return NextResponse.json({
      success: true,
      properties: transformedProperties
    })

  } catch (error) {
    console.error('Error fetching host properties:', error)
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name,
      title, 
      description, 
      location, 
      pricePerNight, 
      maxGuests, 
      bedrooms, 
      bathrooms, 
      propertyType,
      amenities,
      images,
      checkInTime,
      checkOutTime,
      ownerAddress,
      metadataURI,
      bstStaked 
    } = body

    if (!ownerAddress) {
      return NextResponse.json({ error: 'Owner address required' }, { status: 400 })
    }

    // Check if user exists, if not create one
    let user = await prisma.user.findUnique({
      where: { walletAddress: ownerAddress.toLowerCase() }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress: ownerAddress.toLowerCase(),
          isHost: true
        }
      })
    } else {
      // Update user to be a host if not already
      if (!user.isHost) {
        await prisma.user.update({
          where: { walletAddress: ownerAddress.toLowerCase() },
          data: { isHost: true }
        })
      }
    }

    const property = await prisma.property.create({
      data: {
        tokenId: Math.floor(Math.random() * 1000000), // Will be replaced with actual NFT token ID
        title: title || name,
        description,
        location,
        pricePerNight: parseFloat(pricePerNight),
        maxGuests: parseInt(maxGuests),
        bedrooms: parseInt(bedrooms),
        bathrooms: parseInt(bathrooms),
        propertyType,
        amenities: amenities || [],
        images: images || [],
        checkInTime,
        checkOutTime,
        ownerAddress: ownerAddress.toLowerCase(),
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      property: {
        id: property.id,
        title: property.title,
        message: 'Property created successfully'
      }
    })

  } catch (error) {
    console.error('Error creating property:', error)
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
