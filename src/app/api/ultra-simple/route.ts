import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ 
    success: true, 
    message: 'Ultra simple API works',
    timestamp: Date.now()
  })
}

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: 'Ultra simple GET works',
    timestamp: Date.now()
  })
}
