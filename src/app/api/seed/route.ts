import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST() {
  try {
    // Create test user first
    const testUser = await prisma.user.upsert({
      where: { address: '0x1234567890123456789012345678901234567890' },
      update: {},
      create: {
        address: '0x1234567890123456789012345678901234567890',
        displayName: 'Test User',
        email: 'test@example.com',
        isVerified: true,
        avatar: null
      },
    })

    // Create test properties
    const properties = [
      {
        tokenId: 1,
        title: 'Modern Apartment in District 1',
        description: 'Beautiful modern apartment in the heart of Ho Chi Minh City',
        location: 'District 1, Ho Chi Minh City, Vietnam',
        pricePerNight: 50.0,
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 2,
        propertyType: 'apartment',
        images: ['https://via.placeholder.com/800x600?text=Modern+Apartment'],
        amenities: ['WiFi', 'Air Conditioning', 'Kitchen'],
        checkInTime: '15:00',
        checkOutTime: '11:00',
        ownerAddress: testUser.address,
        ownerId: testUser.id,
        isActive: true
      },
      {
        tokenId: 2,
        title: 'Cozy Studio in District 3',
        description: 'Perfect studio for solo travelers or couples',
        location: 'District 3, Ho Chi Minh City, Vietnam',
        pricePerNight: 35.0,
        maxGuests: 2,
        bedrooms: 1,
        bathrooms: 1,
        propertyType: 'studio',
        images: ['https://via.placeholder.com/800x600?text=Cozy+Studio'],
        amenities: ['WiFi', 'Air Conditioning'],
        checkInTime: '14:00',
        checkOutTime: '12:00',
        ownerAddress: testUser.address,
        ownerId: testUser.id,
        isActive: true
      },
      {
        tokenId: 3,
        title: 'Luxury Villa in District 2',
        description: 'Spacious villa with garden and pool',
        location: 'District 2, Ho Chi Minh City, Vietnam',
        pricePerNight: 120.0,
        maxGuests: 8,
        bedrooms: 4,
        bathrooms: 3,
        propertyType: 'villa',
        images: ['https://via.placeholder.com/800x600?text=Luxury+Villa'],
        amenities: ['WiFi', 'Pool', 'Garden', 'Parking'],
        checkInTime: '16:00',
        checkOutTime: '10:00',
        ownerAddress: testUser.address,
        ownerId: testUser.id,
        isActive: true
      },
      {
        tokenId: 4,
        title: 'Hanoi Old Quarter House',
        description: 'Traditional house in historic Hanoi',
        location: 'Hoan Kiem, Hanoi, Vietnam',
        pricePerNight: 45.0,
        maxGuests: 6,
        bedrooms: 3,
        bathrooms: 2,
        propertyType: 'house',
        images: ['https://via.placeholder.com/800x600?text=Hanoi+House'],
        amenities: ['WiFi', 'Traditional Decor'],
        checkInTime: '15:00',
        checkOutTime: '11:00',
        ownerAddress: testUser.address,
        ownerId: testUser.id,
        isActive: true
      }
    ]

    const createdProperties = []
    for (const property of properties) {
      const created = await prisma.property.upsert({
        where: { tokenId: property.tokenId },
        update: {},
        create: property
      })
      createdProperties.push(created)
    }

    return NextResponse.json({
      success: true,
      message: 'Test data created successfully!',
      data: {
        user: testUser,
        properties: createdProperties
      }
    })

  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create test data',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
