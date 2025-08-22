import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Simple API called - no database interaction')
    
    const data = await request.json()
    console.log('🔍 Received data:', data)
    
    // Just return success without touching database
    return NextResponse.json({
      success: true,
      message: 'Simple API working - no database used',
      receivedData: data,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Simple API error:', error)
    return NextResponse.json(
      { 
        error: 'Simple API failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
