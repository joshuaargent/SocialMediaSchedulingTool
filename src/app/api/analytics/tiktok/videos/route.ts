import { NextRequest, NextResponse } from 'next/server';

const CACHE_TTL = 5 * 60 * 1000;
let cachedData: { posts: any[]; summary: any; timestamp: number } | null = null;

// GET /api/analytics/tiktok/videos
export async function GET(request: NextRequest) {
  const days = parseInt(request.nextUrl.searchParams.get('days') || '30');
  
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    return NextResponse.json({ connected: true, platform: 'tiktok', ...cachedData, cached: true });
  }

  const demoVideos = Array.from({ length: 10 }, (_, i) => ({
    id: `tiktok_${i}`,
    title: `TikTok Video ${i + 1}`,
    publishedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    thumbnail: null,
    stats: {
      views: Math.floor(Math.random() * 50000) + 1000,
      likes: Math.floor(Math.random() * 5000) + 100,
      comments: Math.floor(Math.random() * 500) + 10,
      shares: Math.floor(Math.random() * 200) + 5,
    },
  }));

  const summary = {
    totalVideos: demoVideos.length,
    totalViews: demoVideos.reduce((sum: number, v: any) => sum + v.stats.views, 0),
    totalLikes: demoVideos.reduce((sum: number, v: any) => sum + v.stats.likes, 0),
    avgViewsPerVideo: Math.round(demoVideos.reduce((sum: number, v: any) => sum + v.stats.views, 0) / demoVideos.length),
  };

  cachedData = { posts: demoVideos, summary, timestamp: Date.now() };

  return NextResponse.json({ connected: true, platform: 'tiktok', summary, videos: demoVideos, period: { days }, demo: true });
}