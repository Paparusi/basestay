import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Property creation API called')
    
    const data = await request.json()
    console.log('🔍 Received data:', data)
    
    // Minimal property data
    const propertyData = {
      title: 'Test Property',
      description: 'Test description',
      location: 'Test location',
      pricePerNight: 100,
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      propertyType: 'apartment',
      amenities: [],
      images: [],
      owner: 'test-owner'
    }
    
    console.log('🔧 Creating property with data:', propertyData)

    // Try to create property
    const property = await prisma.property.create({
      data: propertyData
    })

    console.log('✅ Property created:', property)
    
    return NextResponse.json({
      success: true,
      property,
      message: 'Property created successfully'
    })

  } catch (error) {
    console.error('❌ Property creation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create property',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
