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

    // For now, return empty data until database is configured
    // Later this will query the real database for earnings
    const earnings: any[] = [];
    const totalEarnings = 0;
    const monthlyEarnings = 0;
    const averageDailyRate = 0;

    return NextResponse.json({
      earnings,
      totalEarnings,
      monthlyEarnings,
      averageDailyRate,
      total: earnings.length,
    });

  } catch (error) {
    console.error('Error fetching earnings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch earnings' },
      { status: 500 }
    );
  }
}
