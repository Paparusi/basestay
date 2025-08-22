import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const host = searchParams.get('host')

    if (!host) {
      return NextResponse.json({ error: 'Host address required' }, { status: 400 })
    }

    // Fast response with optimized mock data
    await new Promise(resolve => setTimeout(resolve, 120))

    const bookings = [
      {
        id: '1',
        propertyId: '1',
        propertyTitle: 'Modern Downtown Apartment',
        propertyImage: '/images/property1.jpg',
        guestAddress: '0x1234567890123456789012345678901234567890',
        guestName: 'John Smith',
        checkIn: '2024-03-15',
        checkOut: '2024-03-18',
        totalPrice: 360,
        status: 'confirmed',
        guests: 2,
        createdAt: '2024-03-01',
        notes: 'Looking forward to staying in your beautiful apartment!',
        property: {
          title: 'Modern Downtown Apartment',
          images: ['/images/property1.jpg']
        },
        guest: {
          name: 'John Smith'
        },
        totalAmount: 360
      },
      {
        id: '2',
        propertyId: '2',
        propertyTitle: 'Cozy Beach House',
        propertyImage: '/images/property2.jpg',
        guestAddress: '0x9876543210987654321098765432109876543210',
        guestName: 'Sarah Johnson',
        checkIn: '2024-03-20',
        checkOut: '2024-03-25',
        totalPrice: 1000,
        status: 'pending',
        guests: 4,
        createdAt: '2024-03-10',
        notes: 'Celebrating our anniversary, hoping for a peaceful stay by the ocean.',
        property: {
          title: 'Cozy Beach House',
          images: ['/images/property2.jpg']
        },
        guest: {
          name: 'Sarah Johnson'
        },
        totalAmount: 1000
      },
      {
        id: '3',
        propertyId: '1',
        propertyTitle: 'Modern Downtown Apartment',
        guestAddress: '0x5555666677778888999900001111222233334444',
        checkIn: '2024-02-10',
        checkOut: '2024-02-12',
        totalPrice: 240,
        status: 'completed',
        guests: 1,
        createdAt: '2024-02-05',
        property: {
          title: 'Modern Downtown Apartment',
          images: ['/images/property1.jpg']
        },
        guest: {
          name: 'Alice Wilson'
        },
        totalAmount: 240
      }
    ]

    return NextResponse.json({ 
      bookings,
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      completed: bookings.filter(b => b.status === 'completed').length
    }, {
      headers: {
        'Cache-Control': 's-maxage=30, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    console.error('Bookings API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}
