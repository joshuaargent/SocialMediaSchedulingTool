'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Eye, 
  Heart,
  Download,
  RefreshCw,
  Video,
  Play,
  Users,
  ThumbsUp,
  MessageSquare,
  BarChart2
} from 'lucide-react';
import { clsx } from 'clsx';
import { subDays } from 'date-fns';
import { useAnalyticsStore, usePostsStore, usePlatformStore } from '@/stores';
import type { PlatformStats } from '@/types';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { platformColors } from '@/components/platforms/PlatformIcon';

// ============================================
// Simple Bar Chart Component
// ============================================

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
}

function BarChart({ data, height = 200 }: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((item, idx) => (
        <div key={idx} className="flex-1 flex flex-col items-center gap-1">
          <div 
            className="w-full rounded-t transition-all hover:opacity-80"
            style={{ 
              height: `${(item.value / maxValue) * (height - 30)}px`,
              backgroundColor: item.color || 'var(--color-accent)'
            }}
            title={`${item.label}: ${item.value.toLocaleString()}`}
          />
          <span className="text-xs text-[var(--color-text-muted)] truncate w-full text-center">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================
// Platform Analytics Card
// ============================================

interface PlatformCardProps {
  platform: 'tiktok' | 'facebook' | 'instagram' | 'youtube';
  stats: { posts: number; views: number; engagement: number; engagementRate: number };
  isConnected: boolean;
  onRefresh: () => void;
  isLoading: boolean;
}

function PlatformAnalyticsCard({ platform, stats, isConnected, onRefresh, isLoading }: PlatformCardProps) {
  return (
    <Card className="p-4" hover>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={clsx('w-10 h-10 rounded-full flex items-center justify-center', platformColors[platform].bg)}>
            <span className="text-white font-bold text-lg">{platform.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h3 className="font-semibold capitalize">{platform}</h3>
            <p className="text-xs text-[var(--color-text-muted)]">
              {isConnected ? 'Connected' : 'Not connected'}
            </p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={!isConnected || isLoading}
          className="p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] disabled:opacity-50"
        >
          <RefreshCw className={clsx('w-4 h-4', isLoading && 'animate-spin')} />
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-[var(--color-text-muted)]">Posts</p>
          <p className="text-xl font-bold">{stats.posts}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--color-text-muted)]">Views</p>
          <p className="text-xl font-bold">{stats.views.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--color-text-muted)]">Engagement</p>
          <p className="text-xl font-bold">{stats.engagement.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--color-text-muted)]">Rate</p>
          <p className="text-xl font-bold">{(stats.engagementRate * 100).toFixed(1)}%</p>
        </div>
      </div>
    </Card>
  );
}

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnail: string;
  stats: {
    views: number;
    likes: number;
    comments: number;
  };
}

// ============================================
// YouTube Stats Card Component
// ============================================

interface YouTubeStatsData {
  subscribers: number;
  totalViews: number;
  totalVideos: number;
}

function YouTubeStatsCard() {
  const [stats, setStats] = useState<YouTubeStatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const connections = usePlatformStore((state) => state.connections);
  const isYouTubeConnected = connections.some((c) => c.platform === 'youtube');

  const fetchStats = useCallback(async () => {
    if (!isYouTubeConnected) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analytics/youtube/stats');
      const data = await response.json();

      if (data.connected && data.stats) {
        setStats({
          subscribers: data.stats.subscribers || 0,
          totalViews: data.stats.totalViews || 0,
          totalVideos: data.stats.totalVideos || 0,
        });

        // Update platform stats store
        const updateStats = usePlatformStore.getState().updateStats;
        updateStats('youtube', {
          platform: 'youtube',
          followers: data.stats.subscribers || 0,
          following: 0,
          posts: data.stats.totalVideos || 0,
          totalViews: data.stats.totalViews || 0,
          totalPosts: data.stats.totalVideos || 0,
        });
      } else if (data.error) {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to load YouTube stats');
    } finally {
      setLoading(false);
    }
  }, [isYouTubeConnected]);

  useEffect(() => {
    if (isYouTubeConnected) {
      fetchStats();
    }
  }, [isYouTubeConnected, fetchStats]);

  if (!isYouTubeConnected) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Video className="w-5 h-5 text-[#FF0000]" />
          YouTube Channel Stats
        </h2>
        <Button
          size="sm"
          variant="outline"
          onClick={fetchStats}
          disabled={loading}
        >
          <RefreshCw className={clsx('w-4 h-4 mr-2', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {loading && !stats ? (
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-[var(--color-bg-secondary)] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-4 text-red-500">
          <p className="font-medium">{error}</p>
          <Button size="sm" variant="outline" className="mt-2" onClick={fetchStats}>
            Try Again
          </Button>
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--color-bg-secondary)]">
              <div className="p-3 rounded-full bg-[#FF0000]/10 text-[#FF0000]">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">Subscribers</p>
                <p className="text-xl font-bold">{stats.subscribers.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--color-bg-secondary)]">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">Total Views</p>
                <p className="text-xl font-bold">{stats.totalViews.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--color-bg-secondary)]">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">Videos</p>
                <p className="text-xl font-bold">{stats.totalVideos.toLocaleString()}</p>
              </div>
            </div>
          </div>
          {/* Also update the overall summary stats */}
          <div className="mt-4 p-3 rounded-lg bg-[var(--color-bg-secondary)] text-sm">
            <p className="text-[var(--color-text-muted)]">
              Channel has <span className="font-bold text-[var(--color-text-primary)]">{stats.subscribers.toLocaleString()}</span> subscribers with <span className="font-bold text-[var(--color-text-primary)]">{stats.totalViews.toLocaleString()}</span> total views across <span className="font-bold text-[var(--color-text-primary)]">{stats.totalVideos}</span> videos.
            </p>
          </div>
        </>
      ) : null}
    </Card>
  );
}

// ============================================
// YouTube Videos Section
// ============================================

function YouTubeVideosSection() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const connections = usePlatformStore((state) => state.connections);
  const updateStats = usePlatformStore((state) => state.updateStats);
  const isYouTubeConnected = connections.some((c) => c.platform === 'youtube');

  const fetchVideos = useCallback(async () => {
    if (!isYouTubeConnected) return;
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analytics/youtube/videos?days=365');
      const data = await response.json();
      
      // Store raw response for debugging
      setApiResponse(data);
      
      console.log('YouTube videos API response:', data);
      
      // Check for connection issues first
      if (data.connected === false && data.error) {
        setError(data.error);
        return;
      }
      
      // Check if we have videos
      if (data.videos && Array.isArray(data.videos) && data.videos.length > 0) {
        setVideos(data.videos);
        
        // Update platform stats with real data
        if (data.summary) {
          const stats: PlatformStats = {
            platform: 'youtube',
            followers: 0,
            following: 0,
            posts: data.summary.totalVideos,
            totalViews: data.summary.totalViews,
            totalPosts: data.summary.totalVideos,
          };
          updateStats('youtube', stats);
        }
      } else if (data.error) {
        setError(data.error);
      } else {
        // No videos but no error - show helpful message
        setError(`Found ${data.videos?.length || 0} videos. Check your YouTube account has published videos.`);
      }
    } catch (err) {
      console.error('Failed to fetch YouTube videos:', err);
      setError('Failed to connect to YouTube API');
    } finally {
      setLoading(false);
    }
  }, [isYouTubeConnected, updateStats]);

  // Fetch videos on mount
  useEffect(() => {
    if (isYouTubeConnected) {
      fetchVideos();
    }
  }, [isYouTubeConnected, fetchVideos]);

  if (!isYouTubeConnected) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Video className="w-5 h-5 text-[#FF0000]" />
          Recent YouTube Videos
        </h2>
        <Button 
          size="sm" 
          variant="outline"
          onClick={fetchVideos}
          disabled={loading}
        >
          <RefreshCw className={clsx('w-4 h-4 mr-2', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>
      
      {loading && videos.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-[var(--color-bg-secondary)] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300">
            <p className="font-medium">{error}</p>
            {apiResponse && (
              <p className="text-sm mt-2 opacity-75">
                Response: {JSON.stringify({ connected: apiResponse.connected, videos: apiResponse.videos?.length, error: apiResponse.error })}
              </p>
            )}
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            className="mt-4"
            onClick={() => fetchVideos()}
          >
            Try Again
          </Button>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-8 text-[var(--color-text-muted)]">
          <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">No videos found</p>
          <p className="text-sm mt-1">Your YouTube channel might not have any videos, or there may be an issue with the connection.</p>
          {apiResponse && (
            <p className="text-xs mt-2 opacity-50">
              Debug: {JSON.stringify(apiResponse)}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {videos.slice(0, 10).map((video) => (
            <div 
              key={video.id} 
              className="flex gap-4 p-3 rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer"
              onClick={() => window.open(`https://youtube.com/watch?v=${video.id}`, '_blank')}
            >
              <div className="relative w-32 h-20 rounded overflow-hidden flex-shrink-0 bg-gray-800">
                {video.thumbnail ? (
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-6 h-6 text-gray-500" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate">{video.title}</h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  {new Date(video.publishedAt).toLocaleDateString()}
                </p>
                <div className="flex gap-4 mt-2 text-xs text-[var(--color-text-secondary)]">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {video.stats.views.toLocaleString()} views
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" />
                    {video.stats.likes.toLocaleString()} likes
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {video.stats.comments.toLocaleString()} comments
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ============================================
// Analytics Dashboard Page
// ============================================

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('7');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshedPlatform, setRefreshedPlatform] = useState<string | null>(null);

  const metrics = useAnalyticsStore((state) => state.metrics);
  const posts = usePostsStore((state) => state.posts);
  const platformStats = usePlatformStore((state) => state.platformStats);
  const connections = usePlatformStore((state) => state.connections);
  const updateStats = usePlatformStore((state) => state.updateStats);

  const refreshPlatformAnalytics = useCallback(async (platform: string) => {
    setIsRefreshing(true);
    setRefreshedPlatform(platform);
    
    try {
      const response = await fetch(`/api/analytics/${platform}?days=${dateRange}`);
      if (response.ok) {
        const data = await response.json();
        if (data.analytics) {
          updateStats(platform as any, {
            platform: platform as any,
            followers: data.analytics.summary.followers,
            following: 0,
            posts: data.analytics.summary.posts || 0,
          });
        }
      }
    } catch (error) {
      console.error('Failed to refresh analytics:', error);
    } finally {
      setIsRefreshing(false);
      setRefreshedPlatform(null);
    }
  }, [dateRange, updateStats]);

  const summary = useMemo(() => {
    const totalViews = metrics.reduce((sum, m) => sum + m.views, 0);
    const totalEngagement = metrics.reduce(
      (sum, m) => sum + m.likes + m.comments + m.shares,
      0
    );
    const avgEngagementRate =
      metrics.length > 0
        ? metrics.reduce((sum, m) => sum + m.engagementRate, 0) / metrics.length
        : 0;
    const publishedPosts = posts.filter((p) => p.status === 'published');

    const platformBreakdown = {
      tiktok: { posts: publishedPosts.filter(p => p.platforms.includes('tiktok')).length, views: 0, engagement: 0, engagementRate: 0 },
      facebook: { posts: publishedPosts.filter(p => p.platforms.includes('facebook')).length, views: 0, engagement: 0, engagementRate: 0 },
      instagram: { posts: publishedPosts.filter(p => p.platforms.includes('instagram')).length, views: 0, engagement: 0, engagementRate: 0 },
      youtube: { posts: publishedPosts.filter(p => p.platforms.includes('youtube')).length, views: 0, engagement: 0, engagementRate: 0 },
    };

    return { totalPosts: publishedPosts.length, totalViews, totalEngagement, averageEngagementRate: avgEngagementRate, platformBreakdown };
  }, [metrics, posts]);

  // Calculate views from actual metrics
  const weeklyViewsData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    return days.map((label, idx) => {
      const dayStart = new Date(today);
      dayStart.setDate(today.getDate() - (6 - idx));
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayViews = metrics
        .filter(m => {
          const collectedAt = new Date(m.collectedAt);
          return collectedAt >= dayStart && collectedAt <= dayEnd;
        })
        .reduce((sum, m) => sum + m.views, 0);
      
      return { label, value: dayViews, color: 'var(--color-accent)' };
    });
  }, [metrics]);

  const totalWeeklyViews = weeklyViewsData.reduce((sum, d) => sum + d.value, 0);

  return (
    <>
      <PageHeader 
        title="Analytics" 
        description="Track your content performance"
        align="left"
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-[var(--color-bg-card)] rounded-lg border border-[var(--color-border)] p-1">
              {['7', '14', '30', '90'].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={clsx(
                    'px-3 py-1.5 text-sm rounded-md transition-colors',
                    dateRange === range
                      ? 'bg-[var(--color-accent)] text-white'
                      : 'hover:bg-[var(--color-bg-secondary)]'
                  )}
                >
                  {range}d
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export
            </Button>
          </div>
        }
      />

      <Container>
        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">Total Views</p>
                <p className="text-2xl font-bold">{summary.totalViews.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">Total Engagement</p>
                <p className="text-2xl font-bold">{summary.totalEngagement.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">Avg. Engagement Rate</p>
                <p className="text-2xl font-bold">{(summary.averageEngagementRate * 100).toFixed(2)}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">Posts Published</p>
                <p className="text-2xl font-bold">{summary.totalPosts}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Charts */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Views Over Time</h2>
              <BarChart data={weeklyViewsData} height={250} />
              <div className="flex items-center justify-between mt-4 text-sm text-[var(--color-text-muted)]">
                <span>Total: {totalWeeklyViews.toLocaleString()} views</span>
                {(() => {
                  // Calculate real trend based on analytics data
                  const metrics = useAnalyticsStore.getState().metrics;
                  const now = new Date();
                  const thisWeekStart = subDays(now, 7);
                  const lastWeekStart = subDays(now, 14);
                  
                  const thisWeekMetrics = metrics.filter(m => m.collectedAt >= thisWeekStart);
                  const lastWeekMetrics = metrics.filter(m => m.collectedAt >= lastWeekStart && m.collectedAt < thisWeekStart);
                  
                  const thisWeekViews = thisWeekMetrics.reduce((sum, m) => sum + m.views, 0);
                  const lastWeekViews = lastWeekMetrics.reduce((sum, m) => sum + m.views, 0);
                  
                  let trend = 0;
                  let trendLabel = '0%';
                  let trendClass = 'text-[var(--color-text-muted)]';
                  
                  if (lastWeekViews > 0) {
                    trend = ((thisWeekViews - lastWeekViews) / lastWeekViews) * 100;
                    const sign = trend >= 0 ? '+' : '';
                    trendLabel = `${sign}${trend.toFixed(0)}% vs last week`;
                    trendClass = trend >= 0 ? 'text-green-600' : 'text-red-600';
                  } else if (thisWeekViews > 0) {
                    trendLabel = 'New data this week';
                    trendClass = 'text-[var(--color-accent)]';
                  } else {
                    trendLabel = 'No comparison data';
                    trendClass = 'text-[var(--color-text-muted)]';
                  }
                  
                  const TrendIcon = trend >= 0 ? TrendingUp : TrendingDown;
                  
                  return (
                    <span className={clsx('flex items-center gap-1', trendClass)}>
                      <TrendIcon className="w-4 h-4" />
                      {trendLabel}
                    </span>
                  );
                })()}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Platform Comparison</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['tiktok', 'facebook', 'instagram', 'youtube'] as const).map((platform) => {
                  const platformAnalytics = summary.platformBreakdown[platform];
                  const rate = platformAnalytics.engagementRate > 0 
                    ? (platformAnalytics.engagementRate * 100).toFixed(1) 
                    : '0';
                  
                  return (
                    <div 
                      key={platform}
                      className="p-4 rounded-lg bg-bg-secondary"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium capitalize">{platform}</span>
                        <span className={clsx(
                          'text-sm font-semibold',
                          Number(rate) > 6 ? 'text-green-600' : Number(rate) > 4 ? 'text-amber-600' : 'text-text-secondary'
                        )}>
                          {rate}%
                        </span>
                      </div>
                      <div className="h-2 bg-border rounded-full overflow-hidden">
                        <div 
                          className={clsx(
                            'h-full rounded-full transition-all',
                            platform === 'tiktok' && 'bg-black',
                            platform === 'facebook' && 'bg-[#1877F2]',
                            platform === 'instagram' && 'bg-gradient-to-r from-[#833ab4] to-[#fd1d1d]',
                            platform === 'youtube' && 'bg-[#FF0000]'
                          )}
                          style={{ width: `${Math.min(Number(rate) * 10, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-text-muted mt-2">
                        Engagement Rate
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* YouTube Stats Card */}
            <YouTubeStatsCard />

            {/* YouTube Videos Section */}
            <YouTubeVideosSection />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Engagement Breakdown</h2>
              <div className="space-y-3">
                {(() => {
                  const totalLikes = metrics.reduce((sum, m) => sum + m.likes, 0);
                  const totalComments = metrics.reduce((sum, m) => sum + m.comments, 0);
                  const totalShares = metrics.reduce((sum, m) => sum + m.shares, 0);
                  
                  return [
                    { label: 'Likes', value: totalLikes, color: '#E4405F' },
                    { label: 'Comments', value: totalComments, color: '#2563EB' },
                    { label: 'Shares', value: totalShares, color: '#16A34A' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm">{label}</span>
                      </div>
                      <span className="font-medium">{value.toLocaleString()}</span>
                    </div>
                  ));
                })()}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Platform Stats</h2>
              <div className="space-y-4">
                {(['tiktok', 'facebook', 'instagram', 'youtube'] as const).map((platform) => {
                  const stats = platformStats[platform];
                  const platformAnalytics = summary.platformBreakdown[platform];
                  const isConnected = connections.some((c) => c.platform === platform);
                  
                  return (
                    <PlatformAnalyticsCard
                      key={platform}
                      platform={platform}
                      stats={platformAnalytics}
                      isConnected={isConnected}
                      onRefresh={() => refreshPlatformAnalytics(platform)}
                      isLoading={isRefreshing && refreshedPlatform === platform}
                    />
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </>
  );
}