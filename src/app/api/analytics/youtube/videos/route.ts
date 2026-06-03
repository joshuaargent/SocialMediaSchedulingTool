import { NextRequest, NextResponse } from 'next/server';

const CACHE_TTL = 5 * 60 * 1000;
let videoCache: { videos: any[]; summary: any; timestamp: number } | null = null;

// GET /api/analytics/youtube/videos
export async function GET(request: NextRequest) {
  const days = parseInt(request.nextUrl.searchParams.get('days') || '365');
  const forceRefresh = request.nextUrl.searchParams.get('refresh') === 'true';

  // Check cache (skip if force refresh)
  if (!forceRefresh && videoCache && Date.now() - videoCache.timestamp < CACHE_TTL) {
    return NextResponse.json({
      connected: true,
      platform: 'youtube',
      ...videoCache,
      cached: true,
    });
  }

  // Get YouTube tokens from cookies
  let accessToken = request.cookies.get('yt_access_token')?.value;
  const refreshToken = request.cookies.get('yt_refresh_token')?.value;

  // If no access token but we have refresh token, try to get a new one
  if (!accessToken && refreshToken) {
    const clientId = process.env.YOUTUBE_CLIENT_ID;
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;

    if (clientId && clientSecret) {
      try {
        const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
          }),
        });

        if (refreshResponse.ok) {
          const tokenData = await refreshResponse.json();
          accessToken = tokenData.access_token;
          console.log('Successfully refreshed YouTube access token');
        } else {
          const errorText = await refreshResponse.text();
          console.error('Token refresh failed:', refreshResponse.status, errorText);
        }
      } catch (e) {
        console.error('Failed to refresh token:', e);
      }
    }
  }

  // If still no access token
  if (!accessToken) {
    return NextResponse.json({
      connected: false,
      platform: 'youtube',
      error: 'YouTube not connected. Please connect in Settings.',
    }, { status: 401 });
  }

  try {
    // Calculate date range - search all time if days is large
    const publishedAfter = new Date();
    publishedAfter.setDate(publishedAfter.getDate() - days);

    console.log('Fetching YouTube videos with days:', days, 'publishedAfter:', publishedAfter.toISOString());

    // Fetch user's videos from YouTube Data API using search
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&mine=true&type=video&order=date&maxResults=50&publishedAfter=${publishedAfter.toISOString()}`,
      { headers: { 'Authorization': `Bearer ${accessToken}` }}
    );

    const searchData = await searchResponse.json();

    console.log('YouTube search response status:', searchResponse.status);
    console.log('YouTube search response keys:', Object.keys(searchData));
    
    // Check for API errors
    if (searchData.error) {
      console.error('YouTube API error:', searchData.error);
      return NextResponse.json({
        connected: false,
        platform: 'youtube',
        error: searchData.error.message || 'YouTube API error',
        errorCode: searchData.error.code,
      }, { status: 500 });
    }

    // If no items, try fetching all videos without date filter
    if (!searchData.items || searchData.items.length === 0) {
      console.log('No videos with date filter, trying without date...');
      
      // Try without publishedAfter filter
      const allVideosResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&mine=true&type=video&order=date&maxResults=50`,
        { headers: { 'Authorization': `Bearer ${accessToken}` }}
      );
      
      const allVideosData = await allVideosResponse.json();
      
      if (allVideosData.items && allVideosData.items.length > 0) {
        console.log('Found', allVideosData.items.length, 'videos without date filter');
        const result = await processVideos(allVideosData, accessToken);
        videoCache = { videos: result.videos, summary: result.summary, timestamp: Date.now() };
        return NextResponse.json({
          connected: true,
          platform: 'youtube',
          ...result,
          period: { days: 'all' },
        });
      }
      
      // Return empty
      const emptyResult = {
        videos: [],
        summary: { totalVideos: 0, totalViews: 0, totalLikes: 0, totalComments: 0, avgViewsPerVideo: 0 },
      };
      videoCache = { ...emptyResult, timestamp: Date.now() };
      return NextResponse.json({
        connected: true,
        platform: 'youtube',
        ...emptyResult,
        period: { days },
        message: 'No videos found',
      });
    }

    // Get video IDs for stats
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
    console.log('Fetching stats for', videoIds.split(',').length, 'videos');

    // Fetch video statistics
    const statsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet,contentDetails&id=${videoIds}`,
      { headers: { 'Authorization': `Bearer ${accessToken}` }}
    );

    const statsData = await statsResponse.json();

    // Process videos
    const result = await processVideos(searchData, accessToken, statsData);

    // Update cache
    videoCache = { videos: result.videos, summary: result.summary, timestamp: Date.now() };

    console.log('Returning', result.videos.length, 'videos');

    return NextResponse.json({
      connected: true,
      platform: 'youtube',
      ...result,
      period: { days },
    });

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
      connected: false,
      platform: 'youtube',
      error: 'Failed to fetch YouTube videos',
    }, { status: 500 });
  }
}

async function processVideos(searchData: any, accessToken: string, statsData?: any) {
  // If we don't have stats data yet, fetch it
  if (!statsData && searchData.items && searchData.items.length > 0) {
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
    const statsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet,contentDetails&id=${videoIds}`,
      { headers: { 'Authorization': `Bearer ${accessToken}` }}
    );
    statsData = await statsResponse.json();
  }

  // Combine search and stats data
  const videos = statsData?.items?.map((video: any) => {
    const searchItem = searchData.items?.find((s: any) => s.id.videoId === video.id);
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

  return { videos, summary };
}