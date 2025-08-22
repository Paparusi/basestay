import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log('🔍 Received data in API:', JSON.stringify(data, null, 2))
    
    // Extract fields with defaults - NO VALIDATION, JUST DEFAULTS
    const {
      title = 'Untitled Property',
      description = 'No description provided',
      location = 'Location not specified', 
      pricePerNight = 50,
      maxGuests = 1,
      bedrooms = 1,
      bathrooms = 1,
      owner = 'unknown'
    } = data

    // Create property in Railway PostgreSQL database
    const property = await prisma.property.create({
      data: {
        title: String(title).trim() || 'Untitled Property',
        description: String(description).trim() || 'No description provided',
        location: String(location).trim() || 'Location not specified',
        pricePerNight: Number(pricePerNight) || 50,
        maxGuests: Number(maxGuests) || 1,
        bedrooms: Number(bedrooms) || 1,
        bathrooms: Number(bathrooms) || 1,
        propertyType: data.propertyType || 'apartment',
        amenities: Array.isArray(data.amenities) ? data.amenities : [],
        images: Array.isArray(data.images) ? data.images : [],
        owner: String(owner).toLowerCase() || 'unknown'
      }
    })

    console.log('✅ Property created in database:', property.id)
    
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
