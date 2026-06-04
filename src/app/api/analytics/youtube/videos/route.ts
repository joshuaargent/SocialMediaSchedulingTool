import { NextRequest, NextResponse } from 'next/server';
import { isDatabaseConfigured, requirePrisma } from '@/lib/db/prisma';

const CACHE_TTL = 5 * 60 * 1000;
let videoCache: { videos: any[]; summary: any; channelInfo: any; timestamp: number } | null = null;

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

  // Get organization ID
  const orgId = request.cookies.get('current_org_id')?.value;

  // Get tokens from database first (if org exists), then fall back to cookies
  let accessToken = request.cookies.get('yt_access_token')?.value;
  let refreshToken = request.cookies.get('yt_refresh_token')?.value;

  // Try to get tokens from database if org is logged in
  if (orgId && isDatabaseConfigured()) {
    try {
      const db = requirePrisma();
      const dbConnection = await db.platformConnection.findUnique({
        where: {
          organizationId_platform: {
            organizationId: orgId,
            platform: 'youtube',
          },
        },
      });
      
      if (dbConnection?.accessToken) {
        accessToken = dbConnection.accessToken;
        refreshToken = dbConnection.refreshToken || refreshToken;
      }
    } catch (err) {
      console.error('Failed to fetch tokens from DB:', err);
    }
  }

  // Parse channel ID from yt_stats cookie
  const ytStatsCookie = request.cookies.get('yt_stats')?.value;
  let channelId: string | null = null;
  let channelStatsFromCookie: any = null;
  if (ytStatsCookie) {
    try {
      const stats = JSON.parse(ytStatsCookie);
      channelId = stats.channelId;
      channelStatsFromCookie = stats;
    } catch (e) {
      console.log('Failed to parse yt_stats cookie');
    }
  }

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
          
          // Update DB with new token
          if (orgId && isDatabaseConfigured()) {
            try {
              await requirePrisma().platformConnection.update({
                where: {
                  organizationId_platform: {
                    organizationId: orgId,
                    platform: 'youtube',
                  },
                },
                data: {
                  accessToken: tokenData.access_token,
                  expiresAt: tokenData.expires_at ? new Date(tokenData.expires_at * 1000) : null,
                },
              });
            } catch (e) {
              console.error('Failed to update token in DB:', e);
            }
          }
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
    let allVideos: any[] = [];
    let channelInfo: any = null;
    
    // Strategy 1: Use channel's uploads playlist (most reliable)
    if (channelId) {
      // Get full channel info with statistics
      const channelResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${channelId}`,
        { headers: { 'Authorization': `Bearer ${accessToken}` }}
      );

      const channelData = await channelResponse.json();

      if (channelData.items && channelData.items[0]) {
        const channel = channelData.items[0];
        channelInfo = {
          id: channel.id,
          title: channel.snippet.title,
          description: channel.snippet.description,
          thumbnail: channel.snippet.thumbnails?.medium?.url || channel.snippet.thumbnails?.default?.url,
          subscribers: parseInt(channel.statistics.subscriberCount || '0'),
          totalViews: parseInt(channel.statistics.viewCount || '0'),
          videoCount: parseInt(channel.statistics.videoCount || '0'),
          hiddenSubscriberCount: channel.statistics.hiddenSubscriberCount || false,
          uploadsPlaylistId: channel.contentDetails.relatedPlaylists.uploads,
        };

        const uploadsPlaylistId = channel.contentDetails.relatedPlaylists.uploads;

        if (uploadsPlaylistId) {
          // Get all videos from uploads playlist
          let nextPageToken = '';

          do {
            const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
            const playlistResponse = await fetch(playlistUrl, {
              headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            const playlistData = await playlistResponse.json();

            if (playlistData.items && playlistData.items.length > 0) {
              // Get video IDs for stats
              const videoIds = playlistData.items
                .map((item: any) => item.contentDetails.videoId)
                .join(',');

              // Fetch stats and content details in batches of 50
              const detailsResponse = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoIds}`,
                { headers: { 'Authorization': `Bearer ${accessToken}` }}
              );

              const detailsData = await detailsResponse.json();
              const detailsMap: Map<string, any> = new Map(detailsData.items?.map((v: any) => [v.id, v]) || []);

              // Combine data
              for (const item of playlistData.items) {
                const videoId = item.contentDetails.videoId;
                const videoDetails = detailsMap.get(videoId);

                if (videoDetails) {
                  // Parse duration (ISO 8601 format)
                  const duration = videoDetails.contentDetails?.duration || 'PT0S';
                  const durationSeconds = parseDuration(duration);

                  allVideos.push({
                    id: videoId,
                    title: item.snippet.title,
                    description: item.snippet.description,
                    publishedAt: item.snippet.publishedAt,
                    publishedAtTimestamp: new Date(item.snippet.publishedAt).getTime(),
                    thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
                    channelTitle: item.snippet.channelTitle,
                    channelId: item.snippet.channelId,
                    duration: durationSeconds,
                    durationFormatted: formatDuration(duration),
                    privacyStatus: item.snippet.privacyStatus || 'public',
                    stats: {
                      views: parseInt(videoDetails.statistics?.viewCount || '0'),
                      likes: parseInt(videoDetails.statistics?.likeCount || '0'),
                      comments: parseInt(videoDetails.statistics?.commentCount || '0'),
                      favorites: parseInt(videoDetails.statistics?.favoriteCount || '0'),
                    },
                    contentDetails: {
                      duration: duration,
                      dimension: videoDetails.contentDetails?.dimension,
                      definition: videoDetails.contentDetails?.definition,
                      caption: videoDetails.contentDetails?.caption,
                      licensedContent: videoDetails.contentDetails?.licensedContent,
                      projection: videoDetails.contentDetails?.projection,
                    },
                  });
                }
              }

              nextPageToken = playlistData.nextPageToken || '';
            } else {
              break;
            }
          } while (nextPageToken && allVideos.length < 500);
        }
      }
    }

    // Strategy 2: Use mine=true with search if no videos found
    if (allVideos.length === 0) {
      const searchResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&mine=true&type=video&order=date&maxResults=50`,
        { headers: { 'Authorization': `Bearer ${accessToken}` }}
      );

      const searchData = await searchResponse.json();

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
          channelInfo: channelInfo || channelStatsFromCookie,
          message: 'No videos found. Your channel may not have any uploaded videos, or check API permissions.',
          channelId,
        });
      }

      // Fetch video details
      const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
      const detailsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoIds}`,
        { headers: { 'Authorization': `Bearer ${accessToken}` }}
      );

      const detailsData = await detailsResponse.json();
      const detailsMap: Map<string, any> = new Map(detailsData.items?.map((v: any) => [v.id, v]) || []);

      allVideos = searchData.items.map((item: any) => {
        const videoDetails = detailsMap.get(item.id.videoId);
        const duration = videoDetails?.contentDetails?.duration || 'PT0S';
        const durationSeconds = parseDuration(duration);

        return {
          id: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          publishedAt: item.snippet.publishedAt,
          publishedAtTimestamp: new Date(item.snippet.publishedAt).getTime(),
          thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
          channelTitle: item.snippet.channelTitle,
          channelId: item.snippet.channelId,
          duration: durationSeconds,
          durationFormatted: formatDuration(duration),
          privacyStatus: item.snippet.privacyStatus || 'public',
          stats: {
            views: videoDetails ? parseInt(videoDetails.statistics?.viewCount || '0') : 0,
            likes: videoDetails ? parseInt(videoDetails.statistics?.likeCount || '0') : 0,
            comments: videoDetails ? parseInt(videoDetails.statistics?.commentCount || '0') : 0,
            favorites: videoDetails ? parseInt(videoDetails.statistics?.favoriteCount || '0') : 0,
          },
          contentDetails: videoDetails?.contentDetails ? {
            duration: videoDetails.contentDetails.duration,
            dimension: videoDetails.contentDetails.dimension,
            definition: videoDetails.contentDetails.definition,
            caption: videoDetails.contentDetails.caption,
            licensedContent: videoDetails.contentDetails.licensedContent,
          } : null,
        };
      });
    }

    // Calculate comprehensive summary
    const totalViews = allVideos.reduce((sum, v) => sum + v.stats.views, 0);
    const totalLikes = allVideos.reduce((sum, v) => sum + v.stats.likes, 0);
    const totalComments = allVideos.reduce((sum, v) => sum + v.stats.comments, 0);
    const totalDuration = allVideos.reduce((sum, v) => sum + (v.duration || 0), 0);
    const totalFavorites = allVideos.reduce((sum, v) => sum + (v.stats.favorites || 0), 0);

    // Calculate engagement rate
    const engagementRate = totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0;

    const summary = {
      totalVideos: allVideos.length,
      totalViews,
      totalLikes,
      totalComments,
      totalFavorites,
      totalDuration,
      avgViewsPerVideo: allVideos.length > 0 ? Math.round(totalViews / allVideos.length) : 0,
      avgLikesPerVideo: allVideos.length > 0 ? Math.round(totalLikes / allVideos.length) : 0,
      avgCommentsPerVideo: allVideos.length > 0 ? Math.round(totalComments / allVideos.length) : 0,
      avgDurationSeconds: allVideos.length > 0 ? Math.round(totalDuration / allVideos.length) : 0,
      engagementRate,
      // Top performing video
      topVideo: allVideos.length > 0 ? allVideos.reduce((max, v) => 
        v.stats.views > max.stats.views ? v : max, allVideos[0]) : null,
      // Worst performing video
      worstVideo: allVideos.length > 0 ? allVideos.reduce((min, v) => 
        v.stats.views < min.stats.views ? v : min, allVideos[0]) : null,
    };

    // Calculate views over time (aggregated by week)
    const viewsOverTime = calculateViewsOverTime(allVideos);

    videoCache = { videos: allVideos, summary, channelInfo, timestamp: Date.now() };

    return NextResponse.json({
      connected: true,
      platform: 'youtube',
      videos: allVideos,
      summary,
      channelInfo: channelInfo || channelStatsFromCookie,
      viewsOverTime,
      method: channelId ? 'uploads_playlist' : 'search_mine',
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

// Parse ISO 8601 duration to seconds
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  return hours * 3600 + minutes * 60 + seconds;
}

// Format duration for display
function formatDuration(duration: string): string {
  const seconds = parseDuration(duration);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Calculate views over time aggregated by week
function calculateViewsOverTime(videos: any[]): { week: string; views: number; videos: number }[] {
  const weeks: Record<string, { views: number; videos: number }> = {};
  
  for (const video of videos) {
    const date = new Date(video.publishedAt);
    // Get the week start (Sunday)
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (!weeks[weekKey]) {
      weeks[weekKey] = { views: 0, videos: 0 };
    }
    weeks[weekKey].views += video.stats.views;
    weeks[weekKey].videos += 1;
  }
  
  return Object.entries(weeks)
    .map(([week, data]) => ({ week, ...data }))
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-12); // Last 12 weeks
}
