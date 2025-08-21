import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get single property by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params

    const property = await prisma.property.findUnique({
      where: {
        id: propertyId
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
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Calculate stats
    const totalBookings = property.bookings.length
    const totalEarnings = property.bookings.reduce(
      (sum: number, booking: { totalPrice: string | number }) => sum + Number(booking.totalPrice), 
      0
    )
    const avgRating = property.reviews.length > 0 
      ? property.reviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0) / property.reviews.length
      : 0

    const propertyWithStats = {
      ...property,
      stats: {
        totalBookings,
        totalEarnings,
        averageRating: Math.round(avgRating * 10) / 10
      }
    }

    return NextResponse.json({
      success: true,
      property: propertyWithStats
    })

  } catch (error) {
    console.error('Error fetching property:', error)
    return NextResponse.json(
      { error: 'Failed to fetch property' },
      { status: 500 }
    )
  }
}

// DELETE - Delete property by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: propertyId } = await params

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: {
        id: propertyId
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Delete property (this will cascade delete related records)
    await prisma.property.delete({
      where: {
        id: propertyId
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Property deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting property:', error)
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    )
  }
}

// PUT - Update property by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: propertyId } = await params
    const body = await request.json()

    // Check if property exists
    const existingProperty = await prisma.property.findUnique({
      where: {
        id: propertyId
      }
    })

    if (!existingProperty) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Update property
    const updatedProperty = await prisma.property.update({
      where: {
        id: propertyId
      },
      data: {
        title: body.title,
        description: body.description,
        location: body.location,
        pricePerNight: body.pricePerNight,
        maxGuests: body.maxGuests,
        bedrooms: body.bedrooms,
        bathrooms: body.bathrooms,
        propertyType: body.propertyType,
        amenities: body.amenities,
        images: body.images,
        rules: body.rules,
        checkInTime: body.checkInTime,
        checkOutTime: body.checkOutTime,
        isActive: body.isActive !== undefined ? body.isActive : existingProperty.isActive
      }
    })

    return NextResponse.json({
      success: true,
      property: updatedProperty
    })

  } catch (error) {
    console.error('Error updating property:', error)
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    )
  }
}
