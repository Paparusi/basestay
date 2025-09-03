import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const owner = searchParams.get('owner')
    
    if (!owner) {
      return NextResponse.json({ error: 'Owner address is required' }, { status: 400 })
    }

    console.log('📋 Fetching bookings for owner:', owner)

    // For now, return mock data since we don't have bookings table yet
    const mockBookings = [
      {
        id: '1',
        propertyId: 'prop1',
        property: {
          title: 'Sample Property',
          images: ['/images/placeholder.svg']
        },
        guest: {
          name: 'Sample Guest',
          email: 'guest@example.com'
        },
        checkIn: new Date().toISOString(),
        checkOut: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        totalAmount: 500,
        status: 'confirmed',
        createdAt: new Date().toISOString()
      }
    ]

    console.log('✅ Returning bookings:', mockBookings.length)
    return NextResponse.json({ 
      bookings: mockBookings,
      success: true 
    })

  } catch (error) {
    console.error('❌ Error fetching host bookings:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch bookings',
      bookings: [],
      success: false 
    }, { status: 500 })
  }
}