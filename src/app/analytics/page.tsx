'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
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
  BarChart2,
  Calendar,
  Clock
} from 'lucide-react';
import { clsx } from 'clsx';
import { subDays, format, eachDayOfInterval, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { useAnalyticsStore, usePostsStore, usePlatformStore } from '@/stores';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { platformColors } from '@/components/platforms/PlatformIcon';

// ============================================
// Type Definitions
// ============================================

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

interface YouTubeSummary {
  totalVideos: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  avgViewsPerVideo: number;
}

interface DateRangeOption {
  label: string;
  value: string;
  days: number | null;
}

// ============================================
// Bar Chart Component
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

// ============================================
// YouTube Stats Card Component
// ============================================

interface YouTubeStatsData {
  subscribers: number;
  totalViews: number;
  totalVideos: number;
}

function YouTubeStatsCard({ youtubeData }: { youtubeData: { videos: YouTubeVideo[], summary: YouTubeSummary } | null }) {
  const connections = usePlatformStore((state) => state.connections);
  const isYouTubeConnected = connections.some((c) => c.platform === 'youtube');

  if (!isYouTubeConnected || !youtubeData) {
    return null;
  }

  const stats = {
    totalVideos: youtubeData.summary.totalVideos,
    totalViews: youtubeData.summary.totalViews,
    totalLikes: youtubeData.summary.totalLikes,
    totalComments: youtubeData.summary.totalComments,
    avgViews: youtubeData.summary.avgViewsPerVideo,
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Video className="w-5 h-5 text-[#FF0000]" />
        YouTube Channel Stats
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--color-bg-secondary)]">
          <div className="p-3 rounded-full bg-[#FF0000]/10 text-[#FF0000]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)]">Videos</p>
            <p className="text-xl font-bold">{stats.totalVideos.toLocaleString()}</p>
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
          <div className="p-3 rounded-full bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400">
            <ThumbsUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)]">Likes</p>
            <p className="text-xl font-bold">{stats.totalLikes.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--color-bg-secondary)]">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)]">Comments</p>
            <p className="text-xl font-bold">{stats.totalComments.toLocaleString()}</p>
          </div>
        </div>
      </div>
      
      <div className="p-3 rounded-lg bg-[var(--color-bg-secondary)] text-sm">
        <p className="text-[var(--color-text-muted)]">
          Average <span className="font-bold text-[var(--color-text-primary)]">{stats.avgViews.toLocaleString()}</span> views per video
        </p>
      </div>
    </Card>
  );
}

// ============================================
// YouTube Videos Section
// ============================================

function YouTubeVideosSection({ videos }: { videos: YouTubeVideo[] }) {
  const connections = usePlatformStore((state) => state.connections);
  const isYouTubeConnected = connections.some((c) => c.platform === 'youtube');

  if (!isYouTubeConnected) {
    return null;
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Video className="w-5 h-5 text-[#FF0000]" />
        Recent YouTube Videos
        {videos.length > 0 && (
          <span className="text-sm font-normal text-[var(--color-text-muted)]">
            ({videos.length} total)
          </span>
        )}
      </h2>
      
      {videos.length === 0 ? (
        <div className="text-center py-8 text-[var(--color-text-muted)]">
          <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">No videos found</p>
          <p className="text-sm mt-1">Your YouTube channel might not have any videos.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {videos.slice(0, 20).map((video) => (
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
                  {format(new Date(video.publishedAt), 'MMM d, yyyy')}
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
  const [dateRange, setDateRange] = useState('30');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshedPlatform, setRefreshedPlatform] = useState<string | null>(null);
  const [youtubeData, setYoutubeData] = useState<{ videos: YouTubeVideo[], summary: YouTubeSummary } | null>(null);
  const [isLoadingYoutube, setIsLoadingYoutube] = useState(false);
  const fetchingRef = useRef(false);

  const metrics = useAnalyticsStore((state) => state.metrics);
  const posts = usePostsStore((state) => state.posts);
  const platformStats = usePlatformStore((state) => state.platformStats);
  const connections = usePlatformStore((state) => state.connections);
  const updateStats = usePlatformStore((state) => state.updateStats);

  // Date range options
  const dateRangeOptions: DateRangeOption[] = [
    { label: '7d', value: '7', days: 7 },
    { label: '14d', value: '14', days: 14 },
    { label: '30d', value: '30', days: 30 },
    { label: '90d', value: '90', days: 90 },
    { label: 'All', value: 'all', days: null },
  ];

  // Fetch YouTube data with current date range
  const fetchYouTubeData = useCallback(async (days: number | null) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setIsLoadingYoutube(true);
    
    try {
      const isYouTubeConnected = connections.some((c) => c.platform === 'youtube');
      if (!isYouTubeConnected) {
        fetchingRef.current = false;
        setIsLoadingYoutube(false);
        return;
      }

      // Fetch with refresh to get fresh data based on date range
      const response = await fetch(`/api/analytics/youtube/videos?days=${days || 365}&refresh=true`);
      const data = await response.json();
      
      if (data.videos && data.videos.length > 0) {
        setYoutubeData({ videos: data.videos, summary: data.summary });
      } else if (data.connected === false) {
        console.log('YouTube not connected');
      }
    } catch (error) {
      console.error('Failed to fetch YouTube data:', error);
    } finally {
      fetchingRef.current = false;
      setIsLoadingYoutube(false);
    }
  }, [connections]);

  // Fetch on mount and when date range changes
  useEffect(() => {
    fetchYouTubeData(dateRange === 'all' ? null : parseInt(dateRange));
  }, [dateRange, fetchYouTubeData]);

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

    // Get YouTube data if available
    const ytSummary = youtubeData?.summary;
    const ytViews = ytSummary?.totalViews || 0;
    const ytLikes = ytSummary?.totalLikes || 0;
    const ytComments = ytSummary?.totalComments || 0;
    
    // Calculate engagement rate from YouTube data
    const ytEngagementRate = ytViews > 0 ? (ytLikes + ytComments) / ytViews : 0;

    const platformBreakdown = {
      tiktok: { posts: publishedPosts.filter(p => p.platforms.includes('tiktok')).length, views: 0, engagement: 0, engagementRate: 0 },
      facebook: { posts: publishedPosts.filter(p => p.platforms.includes('facebook')).length, views: 0, engagement: 0, engagementRate: 0 },
      instagram: { posts: publishedPosts.filter(p => p.platforms.includes('instagram')).length, views: 0, engagement: 0, engagementRate: 0 },
      youtube: { 
        posts: ytSummary?.totalVideos || publishedPosts.filter(p => p.platforms.includes('youtube')).length, 
        views: ytViews, 
        engagement: ytLikes + ytComments, 
        engagementRate: ytEngagementRate
      },
    };

    // Combine total views from metrics and YouTube
    const combinedViews = totalViews > 0 ? totalViews + ytViews : ytViews;
    const combinedEngagement = totalEngagement > 0 ? totalEngagement + (ytLikes + ytComments) : (ytLikes + ytComments);

    return { 
      totalPosts: publishedPosts.length, 
      totalViews: combinedViews, 
      totalEngagement: combinedEngagement, 
      averageEngagementRate: avgEngagementRate || ytEngagementRate, 
      platformBreakdown 
    };
  }, [metrics, posts, youtubeData]);

  // Calculate views over time based on date range and YouTube data
  const viewsOverTimeData = useMemo(() => {
    const days = dateRange === 'all' ? 365 : parseInt(dateRange);
    const today = new Date();
    const startDate = subDays(today, days - 1);
    
    const dayLabels: { label: string; start: Date; end: Date }[] = [];
    
    if (days <= 14) {
      // Show daily for short periods
      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(today, i);
        dayLabels.push({
          label: format(date, 'EEE'),
          start: new Date(date.setHours(0, 0, 0, 0)),
          end: new Date(date.setHours(23, 59, 59, 999)),
        });
      }
    } else if (days <= 90) {
      // Show weekly for medium periods
      for (let i = Math.ceil(days / 7) - 1; i >= 0; i--) {
        const weekStart = subDays(today, (i + 1) * 7);
        const weekEnd = subDays(today, i * 7);
        dayLabels.push({
          label: `W${Math.ceil(days / 7) - i}`,
          start: new Date(weekStart.setHours(0, 0, 0, 0)),
          end: new Date(weekEnd.setHours(23, 59, 59, 999)),
        });
      }
    } else {
      // Show monthly for long periods
      for (let i = 11; i >= 0; i--) {
        const monthDate = subMonths(today, i);
        dayLabels.push({
          label: format(monthDate, 'MMM'),
          start: startOfMonth(monthDate),
          end: endOfMonth(monthDate),
        });
      }
    }
    
    // Aggregate views from YouTube videos
    return dayLabels.map(({ label, start, end }) => {
      let dayViews = 0;
      
      // Filter YouTube videos by date range
      if (youtubeData?.videos) {
        dayViews = youtubeData.videos
          .filter(v => {
            const publishedAt = new Date(v.publishedAt);
            return publishedAt >= start && publishedAt <= end;
          })
          .reduce((sum, v) => sum + (v.stats?.views || 0), 0);
      }
      
      return { label, value: dayViews, color: 'var(--color-accent)' };
    });
  }, [dateRange, youtubeData]);

  const totalViewsFromChart = viewsOverTimeData.reduce((sum, d) => sum + d.value, 0);

  // Calculate trend vs previous period
  const trend = useMemo(() => {
    if (viewsOverTimeData.length < 2) return { value: 0, label: 'No comparison data' };
    
    const midPoint = Math.floor(viewsOverTimeData.length / 2);
    const firstHalf = viewsOverTimeData.slice(0, midPoint).reduce((sum, d) => sum + d.value, 0);
    const secondHalf = viewsOverTimeData.slice(midPoint).reduce((sum, d) => sum + d.value, 0);
    
    const change = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0;
    return {
      value: change,
      label: change >= 0 ? `+${change.toFixed(0)}% this period` : `${change.toFixed(0)}% this period`,
      isPositive: change >= 0,
    };
  }, [viewsOverTimeData]);

  // Export analytics data
  const exportAnalytics = useCallback(() => {
    const data = {
      exportDate: new Date().toISOString(),
      dateRange,
      summary: {
        totalViews: summary.totalViews,
        totalEngagement: summary.totalEngagement,
        averageEngagementRate: summary.averageEngagementRate,
        totalPosts: summary.totalPosts,
      },
      platformBreakdown: summary.platformBreakdown,
      youtube: youtubeData ? {
        totalVideos: youtubeData.summary.totalVideos,
        totalViews: youtubeData.summary.totalViews,
        totalLikes: youtubeData.summary.totalLikes,
        totalComments: youtubeData.summary.totalComments,
        averageViewsPerVideo: youtubeData.summary.avgViewsPerVideo,
      } : null,
      viewsOverTime: viewsOverTimeData,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${dateRange}-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [dateRange, summary, youtubeData, viewsOverTimeData]);

  return (
    <>
      <PageHeader 
        title="Analytics" 
        description="Track your content performance across all platforms"
        align="left"
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-[var(--color-bg-card)] rounded-lg border border-[var(--color-border)] p-1">
              {dateRangeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDateRange(option.value)}
                  className={clsx(
                    'px-3 py-1.5 text-sm rounded-md transition-colors',
                    dateRange === option.value
                      ? 'bg-[var(--color-accent)] text-white'
                      : 'hover:bg-[var(--color-bg-secondary)]'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={exportAnalytics}
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Views Over Time</h2>
                {isLoadingYoutube && (
                  <span className="text-sm text-[var(--color-text-muted)] flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Loading...
                  </span>
                )}
              </div>
              <BarChart data={viewsOverTimeData} height={250} />
              <div className="flex items-center justify-between mt-4 text-sm text-[var(--color-text-muted)]">
                <span>Total: {totalViewsFromChart.toLocaleString()} views</span>
                <span className={clsx(
                  'flex items-center gap-1',
                  trend.isPositive ? 'text-green-600' : trend.value < 0 ? 'text-red-600' : 'text-[var(--color-text-muted)]'
                )}>
                  {trend.isPositive ? <TrendingUp className="w-4 h-4" /> : trend.value < 0 ? <TrendingDown className="w-4 h-4" /> : null}
                  {trend.label}
                </span>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Platform Comparison</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['tiktok', 'facebook', 'instagram', 'youtube'] as const).map((platform) => {
                  const platformAnalytics = summary.platformBreakdown[platform];
                  const rate = (platformAnalytics.engagementRate * 100).toFixed(1);
                  
                  return (
                    <div 
                      key={platform}
                      className="p-4 rounded-lg bg-[var(--color-bg-secondary)]"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium capitalize">{platform}</span>
                        <span className={clsx(
                          'text-sm font-semibold',
                          Number(rate) > 6 ? 'text-green-600' : Number(rate) > 4 ? 'text-amber-600' : 'text-[var(--color-text-secondary)]'
                        )}>
                          {rate}%
                        </span>
                      </div>
                      <div className="h-2 bg-[var(--color-bg-primary)] rounded-full overflow-hidden">
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
                      <p className="text-xs text-[var(--color-text-muted)] mt-2">
                        {platformAnalytics.posts} posts • {platformAnalytics.views.toLocaleString()} views
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* YouTube Stats Card */}
            <YouTubeStatsCard youtubeData={youtubeData} />

            {/* YouTube Videos Section */}
            <YouTubeVideosSection videos={youtubeData?.videos || []} />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Engagement Breakdown</h2>
              <div className="space-y-3">
                {(() => {
                  const ytLikes = youtubeData?.summary?.totalLikes || 0;
                  const ytComments = youtubeData?.summary?.totalComments || 0;
                  const ytShares = Math.round(ytComments * 0.3);
                  const totalLikes = metrics.reduce((sum, m) => sum + m.likes, 0) + ytLikes;
                  const totalComments = metrics.reduce((sum, m) => sum + m.comments, 0) + ytComments;
                  const totalShares = metrics.reduce((sum, m) => sum + m.shares, 0) + ytShares;
                  
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