import { NextRequest, NextResponse } from 'next/server';

// Comprehensive YouTube Analytics API
// Fetches channel stats, video analytics, and engagement data

const CACHE_TTL = 5 * 60 * 1000;
let analyticsCache: { data: any; timestamp: number } | null = null;

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnail: string;
  duration?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  favorites?: number;
}

interface DailyStats {
  date: string;
  views: number;
  likes: number;
  comments: number;
  newSubscribers: number;
}

interface YouTubeAnalytics {
  channel: {
    id: string;
    title: string;
    subscribers: number;
    totalViews: number;
    videoCount: number;
  };
  summary: {
    totalVideos: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    avgViewsPerVideo: number;
    avgLikesPerVideo: number;
    avgCommentsPerVideo: number;
    engagementRate: number;
  };
  videos: YouTubeVideo[];
  dailyStats: DailyStats[];
  topVideos: YouTubeVideo[];
  engagementBreakdown: {
    likes: number;
    comments: number;
    shares: number;
    total: number;
  };
  performanceMetrics: {
    bestDay: { day: string; avgViews: number };
    bestHour: { hour: number; avgViews: number };
    avgViewsPerDay: number;
    avgLikesPerDay: number;
  };
}

function getCookie(request: NextRequest, name: string): string | null {
  return request.cookies.get(name)?.value || null;
}

function formatDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function getDayOfWeek(dateStr: string): number {
  const date = new Date(dateStr);
  return date.getDay(); // 0 = Sunday
}

function getHourOfDay(dateStr: string): number {
  const date = new Date(dateStr);
  return date.getHours();
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export async function GET(request: NextRequest) {
  const forceRefresh = request.nextUrl.searchParams.get('refresh') === 'true';
  const days = parseInt(request.nextUrl.searchParams.get('days') || '30');

  // Check cache
  if (!forceRefresh && analyticsCache && Date.now() - analyticsCache.timestamp < CACHE_TTL) {
    return NextResponse.json({
      ...analyticsCache.data,
      cached: true,
    });
  }

  // Get tokens
  let accessToken = getCookie(request, 'yt_access_token');
  const refreshToken = getCookie(request, 'yt_refresh_token');
  const ytStatsCookie = getCookie(request, 'yt_stats');

  // Get channel ID
  let channelId: string | null = null;
  if (ytStatsCookie) {
    try {
      const stats = JSON.parse(ytStatsCookie);
      channelId = stats.channelId;
    } catch (e) {
      // ignore
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
        }
      } catch (e) {
        console.error('Token refresh failed:', e);
      }
    }
  }

  if (!accessToken) {
    return NextResponse.json({
      connected: false,
      error: 'YouTube not connected. Please connect in Settings.',
    }, { status: 401 });
  }

  try {
    const allVideos: YouTubeVideo[] = [];
    let channelData: any = null;
    let nextPageToken = '';

    // Strategy: Use uploads playlist to get all videos
    if (channelId) {
      // Get uploads playlist ID
      const channelResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&id=${channelId}`,
        { headers: { 'Authorization': `Bearer ${accessToken}` }}
      );

      channelData = await channelResponse.json();

      if (channelData.items && channelData.items[0]) {
        const channelInfo = channelData.items[0];
        const uploadsPlaylistId = channelInfo.contentDetails.relatedPlaylists.uploads;
        const channelStats = channelInfo.statistics;

        // Get all videos from uploads playlist
        do {
          const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
          
          const playlistResponse = await fetch(playlistUrl, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });

          const playlistData = await playlistResponse.json();

          if (playlistData.items && playlistData.items.length > 0) {
            // Get video IDs
            const videoIds = playlistData.items
              .map((item: any) => item.contentDetails.videoId)
              .join(',');

            // Fetch video details and stats in batches of 50
            const videosResponse = await fetch(
              `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoIds}`,
              { headers: { 'Authorization': `Bearer ${accessToken}` }}
            );

            const videosData = await videosResponse.json();
            const statsMap = new Map(videosData.items?.map((v: any) => [v.id, v]) || []);

            for (const item of playlistData.items) {
              const videoId = item.contentDetails.videoId;
              const videoStats: any = statsMap.get(videoId);

              if (videoStats) {
                allVideos.push({
                  id: videoId,
                  title: item.snippet.title,
                  description: item.snippet.description,
                  publishedAt: item.snippet.publishedAt,
                  thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
                  duration: formatDuration(videoStats.contentDetails?.duration || 'PT0S'),
                  viewCount: parseInt(videoStats.statistics?.viewCount || '0'),
                  likeCount: parseInt(videoStats.statistics?.likeCount || '0'),
                  commentCount: parseInt(videoStats.statistics?.commentCount || '0'),
                  favorites: parseInt(videoStats.statistics?.favoriteCount || '0'),
                });
              }
            }

            nextPageToken = playlistData.nextPageToken || '';
          } else {
            break;
          }
        } while (nextPageToken && allVideos.length < 1000);
      }
    }

    // Calculate summary stats
    const totalViews = allVideos.reduce((sum, v) => sum + v.viewCount, 0);
    const totalLikes = allVideos.reduce((sum, v) => sum + v.likeCount, 0);
    const totalComments = allVideos.reduce((sum, v) => sum + v.commentCount, 0);
    const totalVideos = allVideos.length;

    // Calculate daily stats for the past N days
    const dailyStatsMap = new Map<string, DailyStats>();
    const now = new Date();
    
    // Initialize last N days with zeros
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = formatDate(date);
      dailyStatsMap.set(dateStr, {
        date: dateStr,
        views: 0,
        likes: 0,
        comments: 0,
        newSubscribers: 0,
      });
    }

    // Populate daily stats from videos
    for (const video of allVideos) {
      const videoDate = formatDate(new Date(video.publishedAt));
      const dayStats = dailyStatsMap.get(videoDate);
      
      if (dayStats) {
        dayStats.views += video.viewCount;
        dayStats.likes += video.likeCount;
        dayStats.comments += video.commentCount;
      }
    }

    const dailyStats = Array.from(dailyStatsMap.values())
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate top videos (by views)
    const topVideos = [...allVideos]
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 10);

    // Engagement breakdown
    const engagementBreakdown = {
      likes: totalLikes,
      comments: totalComments,
      shares: Math.round(totalComments * 0.3), // Estimate shares as 30% of comments
      total: totalLikes + totalComments,
    };

    // Calculate engagement rate
    const engagementRate = totalViews > 0 
      ? ((totalLikes + totalComments) / totalViews) * 100 
      : 0;

    // Performance metrics
    const dayTotals = new Map<number, { views: number; count: number }>();
    const hourTotals = new Map<number, { views: number; count: number }>();
    
    for (const video of allVideos) {
      const dayOfWeek = getDayOfWeek(video.publishedAt);
      const hour = getHourOfDay(video.publishedAt);
      
      const dayData = dayTotals.get(dayOfWeek) || { views: 0, count: 0 };
      dayData.views += video.viewCount;
      dayData.count += 1;
      dayTotals.set(dayOfWeek, dayData);
      
      const hourData = hourTotals.get(hour) || { views: 0, count: 0 };
      hourData.views += video.viewCount;
      hourData.count += 1;
      hourTotals.set(hour, hourData);
    }

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let bestDay = { day: 'N/A', avgViews: 0 };
    for (const [day, data] of dayTotals) {
      const avgViews = data.count > 0 ? data.views / data.count : 0;
      if (avgViews > bestDay.avgViews) {
        bestDay = { day: dayNames[day], avgViews };
      }
    }

    let bestHour = { hour: 12, avgViews: 0 };
    for (const [hour, data] of hourTotals) {
      const avgViews = data.count > 0 ? data.views / data.count : 0;
      if (avgViews > bestHour.avgViews) {
        bestHour = { hour, avgViews };
      }
    }

    const totalDaysWithContent = new Set(allVideos.map(v => formatDate(new Date(v.publishedAt)))).size || 1;
    const performanceMetrics = {
      bestDay,
      bestHour,
      avgViewsPerDay: Math.round(totalViews / totalDaysWithContent),
      avgLikesPerDay: Math.round(totalLikes / totalDaysWithContent),
    };

    // Get channel info
    const channelTitle = allVideos[0]?.title?.split(' - ')[0] || 'Your Channel';

    const result: YouTubeAnalytics = {
      channel: {
        id: channelId || 'unknown',
        title: channelTitle,
        subscribers: parseInt(channelData?.items?.[0]?.statistics?.subscriberCount || '0'),
        totalViews: totalViews,
        videoCount: totalVideos,
      },
      summary: {
        totalVideos,
        totalViews,
        totalLikes,
        totalComments,
        avgViewsPerVideo: totalVideos > 0 ? Math.round(totalViews / totalVideos) : 0,
        avgLikesPerVideo: totalVideos > 0 ? Math.round(totalLikes / totalVideos) : 0,
        avgCommentsPerVideo: totalVideos > 0 ? Math.round(totalComments / totalVideos) : 0,
        engagementRate,
      },
      videos: allVideos,
      dailyStats,
      topVideos,
      engagementBreakdown,
      performanceMetrics,
    };

    // Cache the result
    analyticsCache = { data: result, timestamp: Date.now() };

    return NextResponse.json({
      connected: true,
      ...result,
    });

  } catch (error) {
    console.error('YouTube analytics API error:', error);
    return NextResponse.json({
      connected: false,
      error: 'Failed to fetch YouTube analytics: ' + (error instanceof Error ? error.message : 'Unknown error'),
    }, { status: 500 });
  }
}