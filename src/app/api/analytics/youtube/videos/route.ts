import { NextRequest, NextResponse } from 'next/server';
import { usePlatformStore } from '@/stores';

// Cache for video data
let videoCache: { videos: any[]; summary: any; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// GET /api/analytics/youtube/videos - Get YouTube video analytics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  try {
    const platformStore = usePlatformStore.getState();
    const connections = platformStore.connections;
    
    // Check cache first - return cached data immediately
    if (videoCache && Date.now() - videoCache.timestamp < CACHE_TTL) {
      return NextResponse.json({
        connected: true,
        platform: 'youtube',
        ...videoCache,
        cached: true,
      });
    }
    
    // Find YouTube connection
    const youtubeConnection = connections.find((c) => c.platform === 'youtube');
    if (!youtubeConnection?.accessToken || youtubeConnection.accessToken === 'connected_via_oauth') {
      // Return stale cache if available, otherwise error
      if (videoCache) {
        return NextResponse.json({
          connected: true,
          platform: 'youtube',
          ...videoCache,
          cached: true,
          stale: true,
        });
      }
      return NextResponse.json({ 
        error: 'YouTube is not connected',
        connected: false 
      }, { status: 404 });
    }

    const accessToken = youtubeConnection.accessToken;
    const days = parseInt(request.nextUrl.searchParams.get('days') || '30');
    const forceRefresh = request.nextUrl.searchParams.get('refresh') === 'true';
    
    // Calculate date range
    const publishedAfter = new Date();
    publishedAfter.setDate(publishedAfter.getDate() - days);
    
    // Fetch user's videos from YouTube Data API
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&mine=true&type=video&order=date&maxResults=50&publishedAfter=${publishedAfter.toISOString()}`,
      { headers: { 'Authorization': `Bearer ${accessToken}` }}
    );
    
    const searchData = await searchResponse.json();
    
    if (!searchData.items || searchData.items.length === 0) {
      const response = NextResponse.json({
        connected: true,
        platform: 'youtube',
        videos: [],
        summary: { totalVideos: 0, totalViews: 0, totalLikes: 0, totalComments: 0, avgViewsPerVideo: 0 },
        period: { days },
      });
      videoCache = { videos: [], summary: { totalVideos: 0, totalViews: 0, totalLikes: 0, totalComments: 0, avgViewsPerVideo: 0 }, timestamp: Date.now() };
      return response;
    }
    
    // Get video IDs for stats
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
    
    // Fetch video statistics
    const statsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet,contentDetails&id=${videoIds}`,
      { headers: { 'Authorization': `Bearer ${accessToken}` }}
    );
    
    const statsData = await statsResponse.json();
    
    // Combine search and stats data
    const videos = statsData.items?.map((video: any) => {
      const searchItem = searchData.items.find((s: any) => s.id.videoId === video.id);
      return {
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        publishedAt: video.snippet.publishedAt,
        thumbnail: video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url,
        duration: video.contentDetails?.duration || null,
        stats: {
          views: parseInt(video.statistics.viewCount) || 0,
          likes: parseInt(video.statistics.likeCount) || 0,
          comments: parseInt(video.statistics.commentCount) || 0,
          favorites: parseInt(video.statistics.favoriteCount) || 0,
        },
      };
    }) || [];
    
    // Calculate summary stats
    const summary = {
      totalVideos: videos.length,
      totalViews: videos.reduce((sum: number, v: any) => sum + v.stats.views, 0),
      totalLikes: videos.reduce((sum: number, v: any) => sum + v.stats.likes, 0),
      totalComments: videos.reduce((sum: number, v: any) => sum + v.stats.comments, 0),
      avgViewsPerVideo: videos.length > 0 ? Math.round(videos.reduce((sum: number, v: any) => sum + v.stats.views, 0) / videos.length) : 0,
    };

    // Update cache
    videoCache = { videos, summary, timestamp: Date.now() };

    const response = NextResponse.json({
      connected: true,
      platform: 'youtube',
      summary,
      videos,
      period: { days },
    });
    
    return response;
  } catch (error) {
    console.error('YouTube videos API error:', error);
    
    // Return stale cache on error
    if (videoCache) {
      return NextResponse.json({
        connected: true,
        platform: 'youtube',
        ...videoCache,
        cached: true,
        stale: true,
        error: 'Using cached data due to API error',
      });
    }
    
    return NextResponse.json({ 
      error: 'Failed to fetch YouTube videos',
      connected: false 
    }, { status: 500 });
  }
}