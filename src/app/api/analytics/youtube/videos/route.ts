import { NextRequest, NextResponse } from 'next/server';

const CACHE_TTL = 5 * 60 * 1000;
let videoCache: { videos: any[]; summary: any; timestamp: number } | null = null;

// GET /api/analytics/youtube/videos
export async function GET(request: NextRequest) {
  const forceRefresh = request.nextUrl.searchParams.get('refresh') === 'true';

  // Skip cache for debugging, or if forced
  if (!forceRefresh && videoCache && Date.now() - videoCache.timestamp < CACHE_TTL) {
    if (videoCache.videos && videoCache.videos.length > 0) {
      return NextResponse.json({
        connected: true,
        platform: 'youtube',
        ...videoCache,
        cached: true,
      });
    }
  }

  // Get tokens
  let accessToken = request.cookies.get('yt_access_token')?.value;
  const refreshToken = request.cookies.get('yt_refresh_token')?.value;
  const ytStatsCookie = request.cookies.get('yt_stats')?.value;

  // Parse channel ID from yt_stats cookie
  let channelId: string | null = null;
  if (ytStatsCookie) {
    try {
      const stats = JSON.parse(ytStatsCookie);
      channelId = stats.channelId;
    } catch (e) {
      console.log('Failed to parse yt_stats cookie');
    }
  }

  console.log('YouTube videos API: tokens found, channelId:', channelId);

  // Refresh token if needed
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
        }
      } catch (e) {
        console.error('Token refresh failed:', e);
      }
    }
  }

  if (!accessToken) {
    return NextResponse.json({
      connected: false,
      platform: 'youtube',
      error: 'YouTube not connected. Please connect in Settings.',
    }, { status: 401 });
  }

  try {
    // Strategy 1: Use channel's uploads playlist (most reliable)
    if (channelId) {
      console.log('Fetching videos using channel ID:', channelId);

      // Get the uploads playlist ID from the channel
      const channelResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}`,
        { headers: { 'Authorization': `Bearer ${accessToken}` }}
      );

      const channelData = await channelResponse.json();
      console.log('Channel response status:', channelResponse.status);

      if (channelData.error) {
        console.error('Channel API error:', channelData.error);
      }

      if (channelData.items && channelData.items[0]) {
        const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
        console.log('Uploads playlist ID:', uploadsPlaylistId);

        if (uploadsPlaylistId) {
          // Get all videos from uploads playlist
          const allVideos: any[] = [];
          let nextPageToken = '';

          do {
            const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
            const playlistResponse = await fetch(playlistUrl, {
              headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            const playlistData = await playlistResponse.json();
            console.log('Playlist items count:', playlistData.items?.length);

            if (playlistData.items && playlistData.items.length > 0) {
              // Get video IDs for stats
              const videoIds = playlistData.items
                .map((item: any) => item.contentDetails.videoId)
                .join(',');

              // Fetch stats in batches of 50
              const statsResponse = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}`,
                { headers: { 'Authorization': `Bearer ${accessToken}` }}
              );

              const statsData = await statsResponse.json();
              const statsMap = new Map(statsData.items?.map((v: any) => [v.id, v]) || []);

              // Combine data
              for (const item of playlistData.items) {
                const videoId = item.contentDetails.videoId;
                const videoStats = statsMap.get(videoId) as any;

                allVideos.push({
                  id: videoId,
                  title: item.snippet.title,
                  description: item.snippet.description,
                  publishedAt: item.snippet.publishedAt,
                  thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
                  stats: {
                    views: videoStats ? parseInt(videoStats.statistics?.viewCount || '0') : 0,
                    likes: videoStats ? parseInt(videoStats.statistics?.likeCount || '0') : 0,
                    comments: videoStats ? parseInt(videoStats.statistics?.commentCount || '0') : 0,
                  },
                });
              }

              nextPageToken = playlistData.nextPageToken || '';
            } else {
              break;
            }
          } while (nextPageToken && allVideos.length < 500);

          if (allVideos.length > 0) {
            console.log('Found', allVideos.length, 'videos from uploads playlist');

            const summary = {
              totalVideos: allVideos.length,
              totalViews: allVideos.reduce((sum: number, v: any) => sum + v.stats.views, 0),
              totalLikes: allVideos.reduce((sum: number, v: any) => sum + v.stats.likes, 0),
              totalComments: allVideos.reduce((sum: number, v: any) => sum + v.stats.comments, 0),
              avgViewsPerVideo: allVideos.length > 0 ? Math.round(allVideos.reduce((sum: number, v: any) => sum + v.stats.views, 0) / allVideos.length) : 0,
            };

            videoCache = { videos: allVideos, summary, timestamp: Date.now() };

            return NextResponse.json({
              connected: true,
              platform: 'youtube',
              videos: allVideos,
              summary,
              method: 'uploads_playlist',
            });
          }
        }
      }
    }

    // Strategy 2: Use mine=true with search
    console.log('Trying search with mine=true');
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&mine=true&type=video&order=date&maxResults=50`,
      { headers: { 'Authorization': `Bearer ${accessToken}` }}
    );

    const searchData = await searchResponse.json();
    console.log('Search response - items:', searchData.items?.length);

    if (searchData.error) {
      return NextResponse.json({
        connected: false,
        platform: 'youtube',
        error: searchData.error.message || 'YouTube API error',
      }, { status: 500 });
    }

    if (!searchData.items || searchData.items.length === 0) {
      return NextResponse.json({
        connected: true,
        platform: 'youtube',
        videos: [],
        summary: { totalVideos: 0, totalViews: 0, totalLikes: 0, totalComments: 0, avgViewsPerVideo: 0 },
        message: 'No videos found. Your channel may not have any uploaded videos, or check API permissions.',
        channelId,
      });
    }

    // Fetch video stats
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
    const statsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}`,
      { headers: { 'Authorization': `Bearer ${accessToken}` }}
    );

    const statsData = await statsResponse.json();
    const statsMap = new Map(statsData.items?.map((v: any) => [v.id, v]) || []);

    const videos = searchData.items.map((item: any) => {
      const videoStats = statsMap.get(item.id.videoId) as any;
      return {
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        publishedAt: item.snippet.publishedAt,
        thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
        stats: {
          views: videoStats ? parseInt(videoStats.statistics?.viewCount || '0') : 0,
          likes: videoStats ? parseInt(videoStats.statistics?.likeCount || '0') : 0,
          comments: videoStats ? parseInt(videoStats.statistics?.commentCount || '0') : 0,
        },
      };
    });

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
      platform: 'youtube',
      videos,
      summary,
      method: 'search_mine',
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