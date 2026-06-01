import { NextRequest, NextResponse } from 'next/server';
import { usePlatformStore } from '@/stores';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  const days = parseInt(request.nextUrl.searchParams.get('days') || '7');

  const platformStore = usePlatformStore.getState();
  const connections = platformStore.connections;
  
  const connection = connections.find((c) => c.platform === platform);
  
  if (!connection?.accessToken) {
    return NextResponse.json({
      error: `${platform} is not connected`,
      connected: false,
    }, { status: 404 });
  }

  // In production, fetch real analytics from platform APIs:
  // - TikTok: https://open.tiktokapis.com/v2/data/external/analytics/
  // - Facebook/Instagram: Graph API /me/insights
  // - YouTube: YouTube Data API /channels
  
  const mockAnalytics = {
    platform,
    period: { days },
    summary: {
      views: Math.floor(Math.random() * 100000) + 10000,
      likes: Math.floor(Math.random() * 10000) + 1000,
      comments: Math.floor(Math.random() * 1000) + 100,
      shares: Math.floor(Math.random() * 500) + 50,
      followers: Math.floor(Math.random() * 50000) + 5000,
      newFollowers: Math.floor(Math.random() * 500) + 50,
    },
    engagementByDay: Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      views: Math.floor(Math.random() * 10000),
      engagement: Math.floor(Math.random() * 1000),
    })).reverse(),
    peakTimes: [
      { hour: 9, engagement: 0.8 },
      { hour: 12, engagement: 0.6 },
      { hour: 19, engagement: 0.95 },
    ],
  };

  return NextResponse.json({
    connected: true,
    platform,
    analytics: mockAnalytics,
  });
}