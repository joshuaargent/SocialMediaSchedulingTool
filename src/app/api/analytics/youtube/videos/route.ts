import { NextRequest, NextResponse } from 'next/server';
import { usePlatformStore } from '@/stores';

// GET /api/analytics/youtube/videos - Get YouTube video analytics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  try {
    const platformStore = usePlatformStore.getState();
    const connections = platformStore.connections;
    
    // Find YouTube connection
    const youtubeConnection = connections.find((c) => c.platform === 'youtube');
    if (!youtubeConnection?.accessToken) {
      return NextResponse.json({ 
        error: 'YouTube is not connected',
        connected: false 
      }, { status: 404 });
    }

    const accessToken = youtubeConnection.accessToken;
    const days = parseInt(request.nextUrl.searchParams.get('days') || '30');
    
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
      return NextResponse.json({
        connected: true,
        videos: [],
        message: 'No videos found in the specified time period'
      });
    }
    
    // Get video IDs for stats
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
    
    // Fetch video statistics
    const statsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}`,
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
        stats: {
          views: parseInt(video.statistics.viewCount) || 0,
          likes: parseInt(video.statistics.likeCount) || 0,
          comments: parseInt(video.statistics.commentCount) || 0,
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

    return NextResponse.json({
      connected: true,
      platform: 'youtube',
      summary,
      videos,
      period: { days },
    });
  } catch (error) {
    console.error('YouTube videos API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch YouTube videos',
      connected: false 
    }, { status: 500 });
  }
}