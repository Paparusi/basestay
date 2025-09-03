import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const owner = searchParams.get('owner')
    
    if (!owner) {
      return NextResponse.json({ error: 'Owner address is required' }, { status: 400 })
    }

    console.log('📊 Fetching stats for owner:', owner)

    // Get properties count
    const propertiesCount = await prisma.property.count({
      where: { owner: owner }
    })

    // Mock stats for now (until we have bookings table)
    const stats = {
      totalProperties: propertiesCount,
      totalBookings: 0,
      activeBookings: 0,
      totalRevenue: 0,
      totalEarnings: 0,
      averageRating: 0,
      occupancyRate: 0,
      totalViews: 0,
      monthlyRevenue: Array.from({ length: 12 }, (_, i) => ({
        month: new Date(2024, i).toISOString().slice(0, 7),
        revenue: Math.floor(Math.random() * 1000)
      })),
      recentBookings: [],
      upcomingBookings: []
    }

    console.log('✅ Returning stats:', stats)
    return NextResponse.json({ 
      stats,
      success: true 
    })

  } catch (error) {
    console.error('❌ Error fetching host stats:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch stats',
      stats: {
        totalProperties: 0,
        totalBookings: 0,
        totalRevenue: 0,
        averageRating: 0,
        occupancyRate: 0,
        monthlyRevenue: [],
        recentBookings: [],
        upcomingBookings: []
      },
      success: false 
    }, { status: 500 })
  }
}