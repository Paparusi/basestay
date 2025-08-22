import { NextResponse } from 'next/server'

export async function GET() {
  const env = {
    DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'MISSING',
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL ? 'YES' : 'NO',
    VERCEL_ENV: process.env.VERCEL_ENV || 'NOT_SET'
  }
  
  return NextResponse.json({
    success: true,
    environment: env,
    message: 'Environment variables check'
  })
}
