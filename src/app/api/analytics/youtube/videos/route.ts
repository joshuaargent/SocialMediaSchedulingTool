import { NextRequest, NextResponse } from 'next/server';

const CACHE_TTL = 5 * 60 * 1000;
let videoCache: { videos: any[]; summary: any; timestamp: number } | null = null;

// GET /api/analytics/youtube/videos
export async function GET(request: NextRequest) {
  const days = parseInt(request.nextUrl.searchParams.get('days') || '365');
  const forceRefresh = request.nextUrl.searchParams.get('refresh') === 'true';

  // Always skip cache for debugging
  if (!forceRefresh && videoCache && Date.now() - videoCache.timestamp < CACHE_TTL) {
    // Only return cache if it has videos
    if (videoCache.videos && videoCache.videos.length > 0) {
      return NextResponse.json({
        connected: true,
        platform: 'youtube',
        ...videoCache,
        cached: true,
      });
    }
  }

  // Get YouTube tokens from cookies
  let accessToken = request.cookies.get('yt_access_token')?.value;
  const refreshToken = request.cookies.get('yt_refresh_token')?.value;

  console.log('YouTube videos API: checking tokens, has accessToken:', !!accessToken, 'has refreshToken:', !!refreshToken);

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
    console.log('YouTube videos API: No access token found');
    return NextResponse.json({
      connected: false,
      platform: 'youtube',
      error: 'YouTube not connected. Please connect in Settings.',
    }, { status: 401 });
  }

  try {
    // Fetch user's videos from YouTube Data API using search
    // Using 'mine=true' to get videos from the authenticated channel
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&mine=true&type=video&order=date&maxResults=50`;
    console.log('YouTube videos API: Fetching from', searchUrl);
    
    const searchResponse = await fetch(searchUrl, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    const searchData = await searchResponse.json();
    console.log('YouTube search response status:', searchResponse.status);
    console.log('YouTube search response keys:', Object.keys(searchData));
    console.log('YouTube search items count:', searchData.items?.length);
    
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

    // If no items, return empty result
    if (!searchData.items || searchData.items.length === 0) {
      console.log('No videos found in YouTube search');
      const emptyResult = {
        videos: [],
        summary: { totalVideos: 0, totalViews: 0, totalLikes: 0, totalComments: 0, avgViewsPerVideo: 0 },
      };
      // Don't cache empty results
      return NextResponse.json({
        connected: true,
        platform: 'youtube',
        ...emptyResult,
        message: 'No videos found. Make sure your YouTube channel has published videos.',
      });
    }

    console.log('Found', searchData.items.length, 'videos in search, fetching details...');

    // Get video IDs for stats
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
    console.log('Fetching stats for', videoIds.split(',').length, 'videos');

    // Fetch video statistics
    const statsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet,contentDetails&id=${videoIds}`,
      { headers: { 'Authorization': `Bearer ${accessToken}` }}
    );

    const statsData = await statsResponse.json();
    console.log('Stats response keys:', Object.keys(statsData));

    // Process videos
    const result = await processVideos(searchData, accessToken, statsData);

    // Only cache if we have videos
    if (result.videos.length > 0) {
      videoCache = { videos: result.videos, summary: result.summary, timestamp: Date.now() };
    }

    console.log('Returning', result.videos.length, 'videos');

    return NextResponse.json({
      connected: true,
      platform: 'youtube',
      ...result,
    });

  } catch (error) {
    console.error('YouTube videos API error:', error);

    return NextResponse.json({
      connected: false,
      platform: 'youtube',
      error: 'Failed to fetch YouTube videos: ' + (error instanceof Error ? error.message : 'Unknown error'),
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