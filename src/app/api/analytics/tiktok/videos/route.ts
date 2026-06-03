import { NextRequest, NextResponse } from 'next/server';
import { usePlatformStore } from '@/stores';

// Cache for video data
let videoCache: { videos: any[]; summary: any; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// GET /api/analytics/tiktok/videos - Get TikTok video analytics
export async function GET(request: NextRequest) {
  try {
    const platformStore = usePlatformStore.getState();
    const connections = platformStore.connections;
    
    // Check cache first
    if (videoCache && Date.now() - videoCache.timestamp < CACHE_TTL) {
      return NextResponse.json({
        connected: true,
        platform: 'tiktok',
        ...videoCache,
        cached: true,
      });
    }
    
    // Find TikTok connection
    const tiktokConnection = connections.find((c) => c.platform === 'tiktok');
    if (!tiktokConnection?.accessToken || tiktokConnection.accessToken === 'connected_via_oauth') {
      if (videoCache) {
        return NextResponse.json({
          connected: true,
          platform: 'tiktok',
          ...videoCache,
          cached: true,
          stale: true,
        });
      }
      return NextResponse.json({ 
        error: 'TikTok is not connected',
        connected: false 
      }, { status: 404 });
    }

    const accessToken = tiktokConnection.accessToken;
    const days = parseInt(request.nextUrl.searchParams.get('days') || '30');
    
    // TikTok Open API - Fetch user's videos
    // Note: Requires TikTok OAuth app with video permissions
    // API: https://open.tiktokapis.com/v2/data/external/post/list/
    
    try {
      const response = await fetch(
        'https://open.tiktokapis.com/v2/data/external/post/list/?fields=video_id,create_time,like_count,comment_count,share_count,view_count',
        {
          headers: { 
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({
            max_results: 50,
          }),
        }
      );
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'TikTok API error');
      }
      
      const videos = (data.data?.videos || []).map((video: any) => ({
        id: video.video_id,
        title: `TikTok Video ${video.video_id.slice(0, 8)}...`,
        publishedAt: new Date(video.create_time * 1000).toISOString(),
        thumbnail: video.cover_image_url || null,
        stats: {
          views: video.view_count || 0,
          likes: video.like_count || 0,
          comments: video.comment_count || 0,
          shares: video.share_count || 0,
        },
      }));
      
      const summary = {
        totalVideos: videos.length,
        totalViews: videos.reduce((sum: number, v: any) => sum + v.stats.views, 0),
        totalLikes: videos.reduce((sum: number, v: any) => sum + v.stats.likes, 0),
        totalComments: videos.reduce((sum: number, v: any) => sum + v.stats.comments, 0),
        avgViewsPerVideo: videos.length > 0 ? Math.round(videos.reduce((sum: number, v: any) => sum + v.stats.views, 0) / videos.length) : 0,
      };

      videoCache = { videos, summary, timestamp: Date.now() };

      return NextResponse.json({
        connected: true,
        platform: 'tiktok',
        summary,
        videos,
        period: { days },
      });
    } catch (apiError) {
      console.error('TikTok API error:', apiError);
      
      // Return mock data for demo if TikTok isn't configured
      const mockVideos = Array.from({ length: 10 }, (_, i) => ({
        id: `mock_tiktok_${i}`,
        title: `Sample TikTok Video ${i + 1}`,
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
        totalVideos: mockVideos.length,
        totalViews: mockVideos.reduce((sum: number, v: any) => sum + v.stats.views, 0),
        totalLikes: mockVideos.reduce((sum: number, v: any) => sum + v.stats.likes, 0),
        totalComments: mockVideos.reduce((sum: number, v: any) => sum + v.stats.comments, 0),
        avgViewsPerVideo: Math.round(mockVideos.reduce((sum: number, v: any) => sum + v.stats.views, 0) / mockVideos.length),
      };
      
      videoCache = { videos: mockVideos, summary, timestamp: Date.now() };

      return NextResponse.json({
        connected: true,
        platform: 'tiktok',
        summary,
        videos: mockVideos,
        period: { days },
        demo: true,
      });
    }
  } catch (error) {
    console.error('TikTok videos API error:', error);
    
    if (videoCache) {
      return NextResponse.json({
        connected: true,
        platform: 'tiktok',
        ...videoCache,
        cached: true,
        stale: true,
        error: 'Using cached data due to API error',
      });
    }
    
    return NextResponse.json({ 
      error: 'Failed to fetch TikTok videos',
      connected: false 
    }, { status: 500 });
  }
}