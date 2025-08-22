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

    // Get host properties
    const properties = await prisma.property.findMany({
      where: {
        ownerAddress: owner.toLowerCase()
      },
      include: {
        bookings: true,
        reviews: true
      }
    })

    if (properties.length === 0) {
      return NextResponse.json({
        totalProperties: 0,
        activeBookings: 0,
        totalEarnings: 0,
        totalBSTStaked: 0,
        totalBSTEarned: 0,
        averageRating: 0,
        totalViews: 0
      })
    }

    // Calculate stats
    const totalProperties = properties.length
    
    const allBookings = properties.flatMap(p => p.bookings)
    const activeBookings = allBookings.filter(b => 
      ['CONFIRMED', 'CHECKED_IN'].includes(b.status)
    ).length
    
    const totalEarnings = allBookings.reduce((sum, booking) => 
      sum + (booking.totalPrice || 0), 0
    )

    const allReviews = properties.flatMap(p => p.reviews)
    const averageRating = allReviews.length > 0
      ? allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length
      : 0

    // Mock values for blockchain-related stats (will be implemented later)
    const totalBSTStaked = properties.length * 1000 // 1000 BST per property
    const totalBSTEarned = Math.floor(totalEarnings * 0.1) // 10% of earnings as BST rewards
    const totalViews = properties.length * 50 // Mock view data

    return NextResponse.json({
      totalProperties,
      activeBookings,
      totalEarnings: parseFloat(totalEarnings.toFixed(2)),
      totalBSTStaked,
      totalBSTEarned,
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalViews
    })

  } catch (error) {
    console.error('Error fetching host stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
