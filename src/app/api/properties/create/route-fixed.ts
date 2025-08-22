import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validate required fields
    const { title, description, location, pricePerNight, maxGuests, bedrooms, bathrooms, owner } = data
    
    if (!title || !description || !location || !pricePerNight || !maxGuests || !owner) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, location, pricePerNight, maxGuests, owner' },
        { status: 400 }
      )
    }

    // Validate data types
    if (isNaN(Number(pricePerNight)) || isNaN(Number(maxGuests))) {
      return NextResponse.json(
        { error: 'pricePerNight and maxGuests must be valid numbers' },
        { status: 400 }
      )
    }

    // Create property in Railway PostgreSQL database
    const property = await prisma.property.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        pricePerNight: Number(pricePerNight),
        maxGuests: Number(maxGuests),
        bedrooms: Number(bedrooms) || 1,
        bathrooms: Number(bathrooms) || 1,
        propertyType: data.propertyType || 'apartment',
        amenities: data.amenities || [],
        images: data.images || [],
        owner: owner.toLowerCase()
      }
    })

    console.log('✅ Property created in database:', property.id)
    
    return NextResponse.json({
      success: true,
      property,
      message: 'Property created successfully'
    }, { 
      status: 201,
      headers: {
        'Cache-Control': 'no-cache',
      }
    })

  } catch (error) {
    console.error('❌ Error creating property:', error)
    
    // Handle Prisma/Database specific errors
    if (error instanceof Error) {
      if (error.message.includes('connection')) {
        return NextResponse.json(
          { error: 'Database connection failed. Please try again.' },
          { status: 503 }
        )
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create property',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
