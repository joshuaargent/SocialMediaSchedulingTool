import { NextRequest, NextResponse } from 'next/server';

// GET /api/analytics/youtube/stats - Get YouTube channel stats
export async function GET(request: NextRequest) {
  // Get YouTube access token from cookie
  let accessToken = request.cookies.get('yt_access_token')?.value;
  const refreshToken = request.cookies.get('yt_refresh_token')?.value;

  // Try to refresh token if access token is missing
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
        console.error('Failed to refresh YouTube token:', e);
      }
    }
  }

  if (!accessToken) {
    return NextResponse.json({
      connected: false,
      platform: 'youtube',
      error: 'YouTube not connected',
    }, { status: 401 });
  }

  try {
    // Fetch channel stats using the channel ID from yt_stats cookie
    const ytStatsCookie = request.cookies.get('yt_stats')?.value;
    let channelId = null;
    
    if (ytStatsCookie) {
      try {
        const stats = JSON.parse(ytStatsCookie);
        channelId = stats.channelId;
      } catch (e) {
        // ignore
      }
    }

    // If we have a channel ID, fetch detailed stats
    if (channelId) {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${channelId}`,
        { headers: { 'Authorization': `Bearer ${accessToken}` }}
      );

      if (response.ok) {
        const data = await response.json();
        
        if (data.items && data.items[0]) {
          const channel = data.items[0];
          const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads;
          
          // Get video count from uploads playlist
          let totalVideos = 0;
          if (uploadsPlaylistId) {
            const playlistResponse = await fetch(
              `https://www.googleapis.com/youtube/v3/playlists?part=contentDetails&id=${uploadsPlaylistId}`,
              { headers: { 'Authorization': `Bearer ${accessToken}` }}
            );
            if (playlistResponse.ok) {
              const playlistData = await playlistResponse.json();
              totalVideos = playlistData.items?.[0]?.contentDetails?.itemCount || 0;
            }
          }

          return NextResponse.json({
            connected: true,
            platform: 'youtube',
            stats: {
              subscribers: parseInt(channel.statistics.subscriberCount) || 0,
              totalViews: parseInt(channel.statistics.viewCount) || 0,
              totalVideos: totalVideos,
              hiddenSubscriberCount: channel.statistics.hiddenSubscriberCount || false,
            },
            channel: {
              id: channel.id,
              title: channel.snippet.title,
              description: channel.snippet.description,
              thumbnail: channel.snippet.thumbnails?.medium?.url || channel.snippet.thumbnails?.default?.url,
              country: channel.snippet.country,
              publishedAt: channel.snippet.publishedAt,
            },
          });
        }
      }
    }

    // Fallback: just use yt_stats cookie
    if (ytStatsCookie) {
      try {
        const stats = JSON.parse(ytStatsCookie);
        return NextResponse.json({
          connected: true,
          platform: 'youtube',
          stats: {
            subscribers: stats.subscribers || 0,
            totalViews: 0,
            totalVideos: 0,
          },
          channel: {
            id: stats.channelId,
            title: stats.channelTitle,
          },
          fromCookie: true,
        });
      } catch (e) {
        // ignore
      }
    }

    return NextResponse.json({
      connected: false,
      platform: 'youtube',
      error: 'Could not fetch channel info',
    }, { status: 500 });

  } catch (error) {
    console.error('YouTube stats API error:', error);
    return NextResponse.json({
      connected: false,
      platform: 'youtube',
      error: 'Failed to fetch YouTube stats',
    }, { status: 500 });
  }
}