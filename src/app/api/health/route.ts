import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect()
    const result = await prisma.$queryRaw`SELECT 1 as test`
    
    return NextResponse.json({
      success: true,
      message: 'Database connected successfully',
      database: 'connected',
      test: result,
      env_check: {
        DATABASE_URL: process.env.DATABASE_URL ? 'present' : 'missing',
        NODE_ENV: process.env.NODE_ENV
      }
    })
  } catch (error: any) {
    console.error('Database connection error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      type: error.constructor.name,
      env_check: {
        DATABASE_URL: process.env.DATABASE_URL ? 'present' : 'missing',
        NODE_ENV: process.env.NODE_ENV
      }
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
