import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Log everything
    console.log('=== PROPERTY TEST ENDPOINT ===')
    console.log('Raw body:', data)
    console.log('Keys in data:', Object.keys(data))
    console.log('Values:', Object.values(data))
    
    // Just return success with the data we received
    return NextResponse.json({
      success: true,
      message: 'Test endpoint - data received successfully',
      receivedData: data,
      dataKeys: Object.keys(data),
      dataCount: Object.keys(data).length
    })
    
  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json(
      { 
        error: 'Test endpoint failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
