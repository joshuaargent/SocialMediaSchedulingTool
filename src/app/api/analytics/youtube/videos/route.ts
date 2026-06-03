import { NextRequest, NextResponse } from 'next/server';

// Cache for demo video data
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let cachedData: { videos: any[]; summary: any; timestamp: number } | null = null;

// GET /api/analytics/youtube/videos - Get YouTube video analytics
export async function GET(request: NextRequest) {
  const days = parseInt(request.nextUrl.searchParams.get('days') || '30');
  
  // Check cache
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    return NextResponse.json({
      connected: true,
      platform: 'youtube',
      ...cachedData,
      cached: true,
    });
  }

  // Return demo data (replace with real YouTube API call when OAuth is configured)
  const demoVideos = Array.from({ length: 15 }, (_, i) => ({
    id: `demo_${i}`,
    title: `Sample YouTube Video ${i + 1}`,
    description: 'Demo video for testing',
    publishedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    thumbnail: `https://picsum.photos/320/180?random=${i}`,
    duration: 'PT10M30S',
    stats: {
      views: Math.floor(Math.random() * 100000) + 1000,
      likes: Math.floor(Math.random() * 10000) + 100,
      comments: Math.floor(Math.random() * 1000) + 10,
      favorites: Math.floor(Math.random() * 500) + 10,
    },
  }));
  
  const summary = {
    totalVideos: demoVideos.length,
    totalViews: demoVideos.reduce((sum: number, v: any) => sum + v.stats.views, 0),
    totalLikes: demoVideos.reduce((sum: number, v: any) => sum + v.stats.likes, 0),
    totalComments: demoVideos.reduce((sum: number, v: any) => sum + v.stats.comments, 0),
    avgViewsPerVideo: Math.round(demoVideos.reduce((sum: number, v: any) => sum + v.stats.views, 0) / demoVideos.length),
  };

  cachedData = { videos: demoVideos, summary, timestamp: Date.now() };

  return NextResponse.json({
    connected: true,
    platform: 'youtube',
    summary,
    videos: demoVideos,
    period: { days },
    demo: true,
  });
}