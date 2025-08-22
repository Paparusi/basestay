import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const owner = searchParams.get('owner')

    if (!owner) {
      return NextResponse.json({ error: 'Owner address required' }, { status: 400 })
    }

    // Optimized response with reduced delay
    await new Promise(resolve => setTimeout(resolve, 150)) // Faster response

    // Return optimized mock data
    const stats = {
      totalProperties: 3,
      activeBookings: 5,
      totalEarnings: 2450,
      averageRating: 4.8,
      totalViews: 1247,
      thisMonth: {
        earnings: 650,
        bookings: 8
      },
      lastMonth: {
        earnings: 520,
        bookings: 6
      },
      occupancyRate: 78,
      averageNightlyRate: 135
    }

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
