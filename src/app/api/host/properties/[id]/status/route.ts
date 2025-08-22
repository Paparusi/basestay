import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { isActive, ownerAddress } = body

    if (!ownerAddress) {
      return NextResponse.json({ error: 'Owner address required' }, { status: 400 })
    }

    // Verify property ownership
    const property = await prisma.property.findFirst({
      where: {
        id,
        ownerAddress: ownerAddress.toLowerCase()
      }
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found or not owned by user' }, { status: 404 })
    }

    // Update property status
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: { isActive }
    })

    return NextResponse.json({
      success: true,
      property: {
        id: updatedProperty.id,
        isActive: updatedProperty.isActive,
        message: `Property ${isActive ? 'activated' : 'deactivated'} successfully`
      }
    })

  } catch (error) {
    console.error('Error updating property status:', error)
    return NextResponse.json(
      { error: 'Failed to update property status' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
