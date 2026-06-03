import { NextRequest, NextResponse } from 'next/server';

const CACHE_TTL = 5 * 60 * 1000;
let videoCache: { videos: any[]; summary: any; timestamp: number } | null = null;

// GET /api/analytics/youtube/videos
export async function GET(request: NextRequest) {
  const days = parseInt(request.nextUrl.searchParams.get('days') || '30');
  const forceRefresh = request.nextUrl.searchParams.get('refresh') === 'true';

  // Check cache (skip if force refresh)
  if (!forceRefresh && videoCache && Date.now() - videoCache.timestamp < CACHE_TTL) {
    const response = NextResponse.json({
      connected: true,
      platform: 'youtube',
      ...videoCache,
      cached: true,
    });
    // Add debug header
    response.headers.set('X-Cache-Status', 'hit');
    return response;
  }

  // Get YouTube access token from cookie
  const accessToken = request.cookies.get('yt_access_token')?.value;
  const refreshToken = request.cookies.get('yt_refresh_token')?.value;

  // Debug: log what we have
  console.log('YouTube API called. Has access token:', !!accessToken, 'Has refresh token:', !!refreshToken);

  if (!accessToken) {
    const response = NextResponse.json({
      connected: false,
      platform: 'youtube',
      error: 'YouTube is not connected. Please connect your YouTube account in Settings.',
      debug: 'No access token found in cookies',
    }, { status: 401 });
    response.headers.set('X-Debug', 'no_token');
    return response;
  }

  try {
    // Calculate date range
    const publishedAfter = new Date();
    publishedAfter.setDate(publishedAfter.getDate() - days);

    // Fetch user's videos from YouTube Data API
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&mine=true&type=video&order=date&maxResults=50&publishedAfter=${publishedAfter.toISOString()}`,
      { headers: { 'Authorization': `Bearer ${accessToken}` }}
    );

    const searchData = await searchResponse.json();

    // Handle token expiration
    if (searchResponse.status === 401 && refreshToken) {
      // Try to refresh the token
      const clientId = process.env.YOUTUBE_CLIENT_ID;
      const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;

      if (clientId && clientSecret) {
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
          const newTokenData = await refreshResponse.json();
          
          // Retry with new token
          const retryResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&mine=true&type=video&order=date&maxResults=50&publishedAfter=${publishedAfter.toISOString()}`,
            { headers: { 'Authorization': `Bearer ${newTokenData.access_token}` }}
          );

          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            // Update cookie with new token
            const result = await processVideos(retryData, newTokenData.access_token);
            const response = NextResponse.json({
              connected: true,
              platform: 'youtube',
              ...result,
              period: { days },
            });
            response.cookies.set('yt_access_token', newTokenData.access_token, {
              httpOnly: false,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 3600,
            });
            videoCache = { videos: result.videos, summary: result.summary, timestamp: Date.now() };
            return response;
          }
        }
      }
    }

    if (!searchData.items || searchData.items.length === 0) {
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
      });
    }

    // Get video IDs for stats
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

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
      error: 'Failed to fetch YouTube videos. Please try again.',
    }, { status: 500 });
  }
}

async function processVideos(searchData: any, accessToken: string, statsData?: any) {
  // If we don't have stats data yet, fetch it
  if (!statsData) {
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
    const statsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet,contentDetails&id=${videoIds}`,
      { headers: { 'Authorization': `Bearer ${accessToken}` }}
    );
    statsData = await statsResponse.json();
  }

  // Combine search and stats data
  const videos = statsData.items?.map((video: any) => {
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