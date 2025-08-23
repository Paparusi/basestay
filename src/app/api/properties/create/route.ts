import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Property creation API called')
    
    const data = await request.json()
    console.log('🔍 Received data:', data)
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'location', 'pricePerNight', 'maxGuests']
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }
    
    // Use actual form data with defaults for optional fields
    const propertyData = {
      title: data.title,
      description: data.description,
      location: data.location,
      pricePerNight: Number(data.pricePerNight),
      maxGuests: Number(data.maxGuests),
      bedrooms: Number(data.bedrooms) || 1,
      bathrooms: Number(data.bathrooms) || 1,
      propertyType: data.propertyType || 'apartment',
      amenities: data.amenities || [],
      images: data.images || [],
      owner: data.owner || 'anonymous'
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
