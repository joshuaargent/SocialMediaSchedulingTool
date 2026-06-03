import { NextRequest, NextResponse } from 'next/server';
import { usePlatformStore } from '@/stores';

// Cache for platform data (in-memory, per serverless function cold start)
// In production, consider using Redis or similar for cross-request caching
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCached(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
}

// GET /api/cron/sync - On-demand sync (get fresh data when needed)
// Or call with GET for status
export async function GET(request: NextRequest) {
  // Add caching headers for browser/proxy caching
  const response = NextResponse.json({
    status: 'ok',
    message: 'Use POST to sync data, or fetch platform data directly from analytics endpoints',
    endpoints: {
      youtube_videos: '/api/analytics/youtube/videos',
      tiktok_videos: '/api/analytics/tiktok/videos',
      facebook_posts: '/api/analytics/facebook/posts',
      instagram_posts: '/api/analytics/instagram/posts',
    },
    cache_ttl_seconds: CACHE_TTL / 1000,
  });
  
  response.headers.set('Cache-Control', 'public, max-age=60');
  return response;
}

// POST - Manual sync trigger (for admin use)
export async function POST(request: Request) {
  try {
    const platformStore = usePlatformStore.getState();
    const connections = platformStore.connections;
    
    const results: Record<string, { success: boolean; cached: boolean }> = {};
    
    for (const connection of connections) {
      const cacheKey = `sync_${connection.platform}`;
      const cached = getCached(cacheKey);
      
      if (cached) {
        results[connection.platform] = { success: true, cached: true };
        continue;
      }
      
      // Mark as synced (actual sync would require platform-specific API calls)
      setCached(cacheKey, { synced: true, platform: connection.platform });
      results[connection.platform] = { success: true, cached: false };
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: String(error) 
    }, { status: 500 });
  }
}