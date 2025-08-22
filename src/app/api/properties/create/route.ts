import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validate required fields
    const { name, description, location, pricePerNight, maxGuests, bedrooms, bathrooms, owner } = data
    
    if (!name || !description || !location || !pricePerNight || !maxGuests || !owner) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create property object
    const property = {
      id: `prop_${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      location: location.trim(),
      pricePerNight: Number(pricePerNight),
      maxGuests: Number(maxGuests),
      bedrooms: Number(bedrooms) || 1,
      bathrooms: Number(bathrooms) || 1,
      amenities: data.amenities || [],
      images: data.images || [],
      owner: owner,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // In production, save to database
    // await prisma.property.create({ data: property })
    
    console.log('✅ Property created:', property.name)
    
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
    
    return NextResponse.json(
      { 
        error: 'Failed to create property',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
