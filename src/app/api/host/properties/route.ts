import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const owner = searchParams.get('owner')

    if (!owner) {
      return NextResponse.json({ error: 'Owner address required' }, { status: 400 })
    }

    // Fast response with optimized mock data
    await new Promise(resolve => setTimeout(resolve, 100))

    const properties = [
      {
        id: '1',
        title: 'Modern Downtown Apartment',
        description: 'Beautiful 2-bedroom apartment in the heart of downtown with amazing city views.',
        location: 'Downtown, City Center',
        pricePerNight: 120,
        images: ['/images/property1.jpg', '/images/property1-2.jpg'],
        status: 'active',
        totalBookings: 15,
        averageRating: 4.8,
        totalEarnings: 1800,
        createdAt: '2024-01-15',
        isActive: true,
        views: 247,
        bookings: 15,
        rating: 4.8,
        reviewCount: 12
      },
      {
        id: '2',
        title: 'Cozy Beach House',
        description: 'Oceanfront property with stunning beach views and direct beach access.',
        location: 'Beachside, Coastal Area',
        pricePerNight: 200,
        images: ['/images/property2.jpg', '/images/property2-2.jpg'],
        status: 'active',
        totalBookings: 8,
        averageRating: 4.9,
        totalEarnings: 1600,
        createdAt: '2024-02-01',
        isActive: true,
        views: 189,
        bookings: 8,
        rating: 4.9,
        reviewCount: 7
      },
      {
        id: '3',
        title: 'Mountain Cabin Retreat',
        description: 'Peaceful cabin surrounded by nature, perfect for a quiet getaway.',
        location: 'Mountain View, Countryside',
        pricePerNight: 80,
        images: ['/images/property3.jpg'],
        status: 'inactive',
        totalBookings: 3,
        averageRating: 4.5,
        totalEarnings: 240,
        createdAt: '2024-02-10',
        isActive: false,
        views: 145,
        bookings: 3,
        rating: 4.5,
        reviewCount: 3
      }
    ]

    return NextResponse.json({ 
      properties,
      total: properties.length,
      active: properties.filter(p => p.status === 'active').length
    }, {
      headers: {
        'Cache-Control': 's-maxage=120, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Properties API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    )
  }
}
