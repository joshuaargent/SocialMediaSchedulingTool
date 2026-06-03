import { NextRequest, NextResponse } from 'next/server';

const CACHE_TTL = 5 * 60 * 1000;
let cachedData: { posts: any[]; summary: any; timestamp: number } | null = null;

// GET /api/analytics/facebook/posts
export async function GET(request: NextRequest) {
  const days = parseInt(request.nextUrl.searchParams.get('days') || '30');
  
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    return NextResponse.json({ connected: true, platform: 'facebook', ...cachedData, cached: true });
  }

  const demoPosts = Array.from({ length: 10 }, (_, i) => ({
    id: `fb_${i}`,
    title: `Facebook Post ${i + 1}`,
    description: 'Sample post content...',
    publishedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    thumbnail: null,
    stats: {
      likes: Math.floor(Math.random() * 5000) + 50,
      comments: Math.floor(Math.random() * 500) + 5,
      shares: Math.floor(Math.random() * 200) + 5,
    },
  }));

  const summary = {
    totalPosts: demoPosts.length,
    totalLikes: demoPosts.reduce((sum: number, p: any) => sum + p.stats.likes, 0),
    totalShares: demoPosts.reduce((sum: number, p: any) => sum + p.stats.shares, 0),
    avgLikesPerPost: Math.round(demoPosts.reduce((sum: number, p: any) => sum + p.stats.likes, 0) / demoPosts.length),
  };

  cachedData = { posts: demoPosts, summary, timestamp: Date.now() };

  return NextResponse.json({ connected: true, platform: 'facebook', summary, posts: demoPosts, period: { days }, demo: true });
}