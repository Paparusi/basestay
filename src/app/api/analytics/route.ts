import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get('owner');

    if (!owner) {
      return NextResponse.json(
        { error: 'Owner address is required' },
        { status: 400 }
      );
    }

    // For now, return empty analytics until database is configured
    const analytics = {
      revenue: { 
        total: 0, 
        thisMonth: 0, 
        lastMonth: 0, 
        change: 0 
      },
      bookings: { 
        total: 0, 
        thisMonth: 0, 
        lastMonth: 0, 
        change: 0 
      },
      occupancyRate: { 
        current: 0, 
        change: 0 
      },
      averageRating: { 
        current: 0, 
        change: 0 
      },
      monthlyData: [],
      topProperties: [],
      recentActivities: []
    };

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
