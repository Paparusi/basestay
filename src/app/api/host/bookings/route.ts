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

    // Get all properties owned by the host
    const hostProperties = await prisma.property.findMany({
      where: {
        ownerAddress: owner.toLowerCase()
      },
      select: {
        id: true,
        title: true,
        images: true
      }
    })

    const propertyIds = hostProperties.map(p => p.id)

    if (propertyIds.length === 0) {
      return NextResponse.json({
        success: true,
        bookings: []
      })
    }

    // Get all bookings for host properties
    const bookings = await prisma.booking.findMany({
      where: {
        propertyId: {
          in: propertyIds
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        property: {
          select: {
            title: true,
            images: true
          }
        },
        guest: {
          select: {
            displayName: true,
            username: true,
            avatar: true,
            walletAddress: true
          }
        }
      }
    })

    // Transform bookings data
    const transformedBookings = bookings.map(booking => ({
      id: booking.id,
      propertyId: booking.propertyId,
      property: {
        title: booking.property.title,
        images: booking.property.images as string[] || []
      },
      guest: {
        name: booking.guest.displayName || booking.guest.username || `User ${booking.guest.walletAddress.slice(0, 6)}...`,
        avatar: booking.guest.avatar
      },
      checkIn: booking.checkInDate.toISOString(),
      checkOut: booking.checkOutDate.toISOString(),
      guests: 1, // Will be added to schema later
      totalAmount: booking.totalPrice,
      status: booking.status.toLowerCase(),
      createdAt: booking.createdAt.toISOString()
    }))

    return NextResponse.json({
      success: true,
      bookings: transformedBookings
    })

  } catch (error) {
    console.error('Error fetching host bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
