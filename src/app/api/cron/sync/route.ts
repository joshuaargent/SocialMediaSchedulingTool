import { NextResponse } from 'next/server';
import { usePlatformStore, useAnalyticsStore, usePostsStore } from '@/stores';

// POST /api/cron/sync - Sync all platform data (called by cron or manually)
// This endpoint refreshes analytics for all connected platforms

export async function POST(request: Request) {
  try {
    const platformStore = usePlatformStore.getState();
    const analyticsStore = useAnalyticsStore.getState();
    const postsStore = usePostsStore.getState();
    
    const connections = platformStore.connections;
    const results: Record<string, { success: boolean; error?: string; stats?: any }> = {};
    
    for (const connection of connections) {
      const platform = connection.platform;
      const accessToken = connection.accessToken;
      
      if (!accessToken || accessToken === 'connected_via_oauth') {
        // Skip platforms without valid tokens
        results[platform] = { success: false, error: 'No valid access token' };
        continue;
      }
      
      try {
        if (platform === 'youtube') {
          // Fetch YouTube channel stats
          const channelResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=statistics&mine=true`,
            { headers: { 'Authorization': `Bearer ${accessToken}` }}
          );
          const channelData = await channelResponse.json();
          
          if (channelData.items && channelData.items[0]) {
            const stats = channelData.items[0].statistics;
            platformStore.updateStats('youtube', {
              platform: 'youtube',
              followers: parseInt(stats.subscriberCount) || 0,
              following: 0,
              posts: parseInt(stats.videoCount) || 0,
            });
            results[platform] = { success: true, stats: {
              subscribers: stats.subscriberCount,
              videos: stats.videoCount,
              views: stats.viewCount,
            }};
          }
          
          // Fetch recent videos for analytics
          const searchResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&mine=true&type=video&order=date&maxResults=20`,
            { headers: { 'Authorization': `Bearer ${accessToken}` }}
          );
          const searchData = await searchResponse.json();
          
          if (searchData.items && searchData.items.length > 0) {
            const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
            const statsResponse = await fetch(
              `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}`,
              { headers: { 'Authorization': `Bearer ${accessToken}` }}
            );
            const statsData = await statsResponse.json();
            
            // Update analytics store with video metrics
            for (const video of statsData.items || []) {
              const searchItem = searchData.items.find((s: any) => s.id.videoId === video.id);
              analyticsStore.addMetrics({
                platform: 'youtube',
                postId: video.id,
                engagement: {
                  views: parseInt(video.statistics.viewCount) || 0,
                  likes: parseInt(video.statistics.likeCount) || 0,
                  comments: parseInt(video.statistics.commentCount) || 0,
                  shares: 0,
                  saves: 0,
                  reach: 0,
                  impressions: 0,
                },
                collectedAt: new Date(),
              });
            }
            results[platform].stats = { ...results[platform].stats, videosFetched: searchData.items.length };
          }
        }
        
        // Add other platforms here (tiktok, facebook, instagram)
      } catch (error) {
        console.error(`Failed to sync ${platform}:`, error);
        results[platform] = { success: false, error: String(error) };
      }
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error('Cron sync error:', error);
    return NextResponse.json({ 
      success: false,
      error: String(error) 
    }, { status: 500 });
  }
}

// GET endpoint to check sync status
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'POST to this endpoint to trigger sync',
  });
}