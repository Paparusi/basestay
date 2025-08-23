import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Property creation API called')
    
    const data = await request.json()
    console.log('🔍 Received data:', JSON.stringify(data, null, 2))
    
    // For debugging - temporarily accept any data
    const propertyData = {
      title: data.title || 'Default Title',
      description: data.description || 'Default Description', 
      location: data.location || 'Default Location',
      pricePerNight: Number(data.pricePerNight) || 100,
      maxGuests: Number(data.maxGuests) || 2,
      bedrooms: Number(data.bedrooms) || 1,
      bathrooms: Number(data.bathrooms) || 1,
      propertyType: data.propertyType || 'apartment',
      amenities: Array.isArray(data.amenities) ? data.amenities : [],
      images: Array.isArray(data.images) ? data.images : [],
      owner: data.owner || 'default-owner'
    }
    
    console.log('🔧 Creating property with data:', JSON.stringify(propertyData, null, 2))

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
