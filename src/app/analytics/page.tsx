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
  BarChart2,
  Calendar,
  Clock,
  Target,
  Award,
  TrendingUpDown
} from 'lucide-react';
import { clsx } from 'clsx';
import { subDays, format, eachDayOfInterval } from 'date-fns';
import { useAnalyticsStore, usePostsStore, usePlatformStore } from '@/stores';
import type { PlatformStats } from '@/types';
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
  duration?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  stats?: { views: number; likes: number; comments: number };
}

interface YouTubeAnalyticsData {
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
  dailyStats: {
    date: string;
    views: number;
    likes: number;
    comments: number;
    newSubscribers: number;
  }[];
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
// Line Chart Component
// ============================================

interface LineChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
}

function TrendLineChart({ data, height = 200, color = 'var(--color-accent)' }: LineChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const points = data.map((item, idx) => {
    const x = (idx / (data.length - 1)) * 100;
    const y = 100 - ((item.value / maxValue) * 100);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="relative" style={{ height }}>
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="var(--color-border)"
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />
        ))}
        {/* Line */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        {/* Area fill */}
        <polygon
          fill={color}
          fillOpacity="0.1"
          points={`0,100 ${points} 100,100`}
        />
        {/* Data points */}
        {data.map((item, idx) => {
          const x = (idx / (data.length - 1)) * 100;
          const y = 100 - ((item.value / maxValue) * 100);
          return (
            <circle
              key={idx}
              cx={x}
              cy={y}
              r="2"
              fill={color}
              className="hover:r-4 transition-all"
            />
          );
        })}
      </svg>
      {/* X-axis labels */}
      <div className="flex justify-between mt-2 text-xs text-[var(--color-text-muted)]">
        {data.filter((_, i) => i % Math.ceil(data.length / 7) === 0).map((item, idx) => (
          <span key={idx}>{item.label}</span>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Donut Chart Component
// ============================================

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
}

function DonutChart({ data, size = 120, thickness = 20 }: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return null;
  
  let cumulativePercent = 0;
  
  return (
    <div className="flex items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={(size - thickness) / 2}
            fill="none"
            stroke="var(--color-bg-secondary)"
            strokeWidth={thickness}
          />
          {data.map((item, idx) => {
            const percent = item.value / total;
            const dashArray = `${percent * 100} ${100 - percent * 100}`;
            const dashOffset = 100 - cumulativePercent * 100;
            cumulativePercent += percent;
            
            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={(size - thickness) / 2}
                fill="none"
                stroke={item.color}
                strokeWidth={thickness}
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                className="transition-all"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold">{total.toLocaleString()}</span>
        </div>
      </div>
      <div className="space-y-2">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-[var(--color-text-secondary)]">{item.label}</span>
            <span className="text-sm font-medium ml-auto pl-4">{item.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
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
  const icons: Record<string, any> = {
    tiktok: <span className="text-lg">🎵</span>,
    facebook: <span className="text-lg">📘</span>,
    instagram: <span className="text-lg">📷</span>,
    youtube: <Video className="w-5 h-5" />,
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow" hover>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={clsx('w-10 h-10 rounded-full flex items-center justify-center', platformColors[platform].bg)}>
            <span className="text-white">{icons[platform]}</span>
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

function YouTubeStatsCard({ analyticsData }: { analyticsData?: YouTubeAnalyticsData }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const connections = usePlatformStore((state) => state.connections);
  const isYouTubeConnected = connections.some((c) => c.platform === 'youtube');
  const updateStats = usePlatformStore((state) => state.updateStats);

  // Use analytics data or derive from it
  const stats = analyticsData?.summary ? {
    subscribers: analyticsData.channel.subscribers,
    totalViews: analyticsData.summary.totalViews,
    totalVideos: analyticsData.summary.totalVideos,
  } : null;

  // Update platform stats store when we have data
  useEffect(() => {
    if (stats) {
      updateStats('youtube', {
        platform: 'youtube',
        followers: stats.subscribers,
        following: 0,
        posts: stats.totalVideos,
        totalViews: stats.totalViews,
        totalPosts: stats.totalVideos,
      });
    }
  }, [stats, updateStats]);

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
        {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
      </div>

      {error ? (
        <div className="text-center py-4 text-red-500">
          <p className="font-medium">{error}</p>
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
          
          {/* Engagement Rate */}
          {analyticsData?.summary && (
            <div className="mt-4 p-3 rounded-lg bg-[var(--color-bg-secondary)]">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-muted)]">Engagement Rate</span>
                <span className="font-bold text-lg">{analyticsData.summary.engagementRate.toFixed(2)}%</span>
              </div>
              <div className="mt-2 h-2 bg-[var(--color-bg-primary)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#FF0000] rounded-full"
                  style={{ width: `${Math.min(analyticsData.summary.engagementRate * 10, 100)}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Performance Insights */}
          {analyticsData?.performanceMetrics && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/20">
                <div className="flex items-center gap-2 text-[var(--color-accent)]">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium">Best Day</span>
                </div>
                <p className="text-lg font-bold mt-1">{analyticsData.performanceMetrics.bestDay.day}</p>
              </div>
              <div className="p-3 rounded-lg bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/20">
                <div className="flex items-center gap-2 text-[var(--color-accent)]">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-medium">Best Hour</span>
                </div>
                <p className="text-lg font-bold mt-1">{analyticsData.performanceMetrics.bestHour.hour}:00</p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-[var(--color-bg-secondary)] rounded-lg animate-pulse" />
          ))}
        </div>
      )}
    </Card>
  );
}

// ============================================
// YouTube Videos Section
// ============================================

function YouTubeVideosSection({ videos, analyticsData }: { videos: YouTubeVideo[], analyticsData?: YouTubeAnalyticsData }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const connections = usePlatformStore((state) => state.connections);
  const isYouTubeConnected = connections.some((c) => c.platform === 'youtube');

  const fetchVideos = useCallback(async () => {
    if (!isYouTubeConnected) return;
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analytics/youtube/videos?days=365&refresh=true');
      const data = await response.json();
      setApiResponse(data);
      
      if (data.connected === false && data.error) {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to connect to YouTube API');
    } finally {
      setLoading(false);
    }
  }, [isYouTubeConnected]);

  // Use provided videos or display loading
  const displayVideos = videos.length > 0 ? videos : [];

  if (!isYouTubeConnected) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Video className="w-5 h-5 text-[#FF0000]" />
          Recent YouTube Videos
          {displayVideos.length > 0 && (
            <span className="text-sm font-normal text-[var(--color-text-muted)]">
              ({displayVideos.length} total)
            </span>
          )}
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
      
      {loading && displayVideos.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-[var(--color-bg-secondary)] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300">
            <p className="font-medium">{error}</p>
          </div>
          <Button size="sm" variant="outline" className="mt-4" onClick={fetchVideos}>
            Try Again
          </Button>
        </div>
      ) : displayVideos.length === 0 ? (
        <div className="text-center py-8 text-[var(--color-text-muted)]">
          <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">No videos found</p>
          <p className="text-sm mt-1">Your YouTube channel might not have any videos.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayVideos.slice(0, 10).map((video) => (
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
                    {(video.viewCount || video.stats?.views || 0).toLocaleString()} views
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" />
                    {(video.likeCount || video.stats?.likes || 0).toLocaleString()} likes
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {(video.commentCount || video.stats?.comments || 0).toLocaleString()} comments
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
  const [youtubeAnalytics, setYoutubeAnalytics] = useState<YouTubeAnalyticsData | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const metrics = useAnalyticsStore((state) => state.metrics);
  const posts = usePostsStore((state) => state.posts);
  const platformStats = usePlatformStore((state) => state.platformStats);
  const connections = usePlatformStore((state) => state.connections);
  const updateStats = usePlatformStore((state) => state.updateStats);

  // Fetch comprehensive YouTube analytics
  const fetchYouTubeAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const response = await fetch(`/api/analytics/youtube?days=${dateRange}`);
      if (response.ok) {
        const data = await response.json();
        if (data.connected) {
          setYoutubeAnalytics(data);
          
          // Update platform stats with real YouTube data
          updateStats('youtube', {
            platform: 'youtube',
            followers: data.channel.subscribers,
            following: 0,
            posts: data.channel.videoCount,
            totalViews: data.summary.totalViews,
            totalPosts: data.channel.videoCount,
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch YouTube analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  }, [dateRange, updateStats]);

  // Fetch on mount and when date range changes
  useEffect(() => {
    const connections = usePlatformStore.getState().connections;
    const isYouTubeConnected = connections.some((c) => c.platform === 'youtube');
    if (isYouTubeConnected) {
      fetchYouTubeAnalytics();
    }
  }, [fetchYouTubeAnalytics]);

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

  // Calculate summary with YouTube data
  const summary = useMemo(() => {
    // Get YouTube stats from analytics data
    const ytViews = youtubeAnalytics?.summary?.totalViews || 0;
    const ytLikes = youtubeAnalytics?.summary?.totalLikes || 0;
    const ytComments = youtubeAnalytics?.summary?.totalComments || 0;
    
    // Calculate from metrics store
    const metricsViews = metrics.reduce((sum, m) => sum + m.views, 0);
    const metricsEngagement = metrics.reduce((sum, m) => sum + m.likes + m.comments + m.shares, 0);
    
    const totalViews = ytViews || metricsViews;
    const totalEngagement = (ytLikes + ytComments) || metricsEngagement;
    
    const avgEngagementRate = totalViews > 0 
      ? ((ytLikes + ytComments) / totalViews) * 100 / 100
      : (metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.engagementRate, 0) / metrics.length : 0);
    
    const publishedPosts = posts.filter((p) => p.status === 'published');

    const platformBreakdown = {
      tiktok: { 
        posts: publishedPosts.filter(p => p.platforms.includes('tiktok')).length, 
        views: 0, 
        engagement: 0, 
        engagementRate: 0 
      },
      facebook: { 
        posts: publishedPosts.filter(p => p.platforms.includes('facebook')).length, 
        views: 0, 
        engagement: 0, 
        engagementRate: 0 
      },
      instagram: { 
        posts: publishedPosts.filter(p => p.platforms.includes('instagram')).length, 
        views: 0, 
        engagement: 0, 
        engagementRate: 0 
      },
      youtube: { 
        posts: youtubeAnalytics?.channel?.videoCount || publishedPosts.filter(p => p.platforms.includes('youtube')).length, 
        views: ytViews, 
        engagement: ytLikes + ytComments, 
        engagementRate: (youtubeAnalytics?.summary?.engagementRate ?? 0) / 100 || 0 
      },
    };

    return { 
      totalPosts: publishedPosts.length, 
      totalViews, 
      totalEngagement, 
      averageEngagementRate: avgEngagementRate, 
      platformBreakdown 
    };
  }, [metrics, posts, youtubeAnalytics]);

  // Views over time from YouTube daily stats
  const viewsChartData = useMemo(() => {
    if (youtubeAnalytics?.dailyStats && youtubeAnalytics.dailyStats.length > 0) {
      return youtubeAnalytics.dailyStats.map((day) => ({
        label: format(new Date(day.date), 'MMM d'),
        value: day.views,
        color: 'var(--color-accent)'
      }));
    }
    
    // Fallback to metrics data
    const days = 7;
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayViews = metrics
        .filter(m => {
          const collectedAt = new Date(m.collectedAt);
          return collectedAt >= dayStart && collectedAt <= dayEnd;
        })
        .reduce((sum, m) => sum + m.views, 0);
      
      result.push({ 
        label: format(date, 'EEE'), 
        value: dayViews, 
        color: 'var(--color-accent)' 
      });
    }
    return result;
  }, [metrics, youtubeAnalytics]);

  const totalViewsFromChart = viewsChartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <>
      <PageHeader 
        title="Analytics" 
        description="Track your content performance across all platforms"
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
            {/* Views Over Time Chart */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Views Over Time</h2>
                <span className="text-sm text-[var(--color-text-muted)]">
                  {loadingAnalytics ? 'Loading...' : `${viewsChartData.length} data points`}
                </span>
              </div>
              <TrendLineChart data={viewsChartData} height={250} color="#0D9488" />
              <div className="flex items-center justify-between mt-4 text-sm text-[var(--color-text-muted)]">
                <span>Total: {totalViewsFromChart.toLocaleString()} views</span>
                {youtubeAnalytics?.performanceMetrics && (
                  <span className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    Avg {(youtubeAnalytics.performanceMetrics.avgViewsPerDay).toLocaleString()}/day
                  </span>
                )}
              </div>
            </Card>

            {/* Top Performing Videos */}
            {youtubeAnalytics?.topVideos && youtubeAnalytics.topVideos.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Award className="w-5 h-5 text-[var(--color-accent)]" />
                    Top Performing Videos
                  </h2>
                </div>
                <div className="space-y-3">
                  {youtubeAnalytics.topVideos.slice(0, 5).map((video, idx) => (
                    <div 
                      key={video.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-hover)] cursor-pointer transition-colors"
                      onClick={() => window.open(`https://youtube.com/watch?v=${video.id}`, '_blank')}
                    >
                      <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{video.title}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {video.viewCount.toLocaleString()} views • {(video.viewCount / (Date.now() - new Date(video.publishedAt).getTime()) * 86400000).toFixed(0)} avg/day
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Platform Comparison */}
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
            <YouTubeStatsCard analyticsData={youtubeAnalytics || undefined} />

            {/* YouTube Videos Section */}
            <YouTubeVideosSection 
              videos={youtubeAnalytics?.videos || []} 
              analyticsData={youtubeAnalytics || undefined} 
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Engagement Breakdown */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Engagement Breakdown</h2>
              
              {youtubeAnalytics?.engagementBreakdown ? (
                <>
                  <DonutChart 
                    data={[
                      { label: 'Likes', value: youtubeAnalytics.engagementBreakdown.likes, color: '#E4405F' },
                      { label: 'Comments', value: youtubeAnalytics.engagementBreakdown.comments, color: '#2563EB' },
                      { label: 'Shares', value: youtubeAnalytics.engagementBreakdown.shares, color: '#16A34A' },
                    ]}
                    size={140}
                  />
                  
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-bg-secondary)]">
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="w-4 h-4 text-[#E4405F]" />
                        <span className="text-sm">Likes</span>
                      </div>
                      <span className="font-bold">{youtubeAnalytics.engagementBreakdown.likes.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-bg-secondary)]">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-[#2563EB]" />
                        <span className="text-sm">Comments</span>
                      </div>
                      <span className="font-bold">{youtubeAnalytics.engagementBreakdown.comments.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-bg-secondary)]">
                      <div className="flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-[#16A34A]" />
                        <span className="text-sm">Shares</span>
                      </div>
                      <span className="font-bold">{youtubeAnalytics.engagementBreakdown.shares.toLocaleString()}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  {(() => {
                    const totalLikes = metrics.reduce((sum, m) => sum + m.likes, 0);
                    const totalComments = metrics.reduce((sum, m) => sum + m.comments, 0);
                    const totalShares = metrics.reduce((sum, m) => sum + m.shares, 0);
                    
                    return [
                      { label: 'Likes', value: totalLikes, color: '#E4405F', icon: ThumbsUp },
                      { label: 'Comments', value: totalComments, color: '#2563EB', icon: MessageSquare },
                      { label: 'Shares', value: totalShares, color: '#16A34A', icon: BarChart2 },
                    ].map(({ label, value, color, icon: Icon }) => (
                      <div key={label} className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-bg-secondary)]">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" style={{ color }} />
                          <span className="text-sm">{label}</span>
                        </div>
                        <span className="font-bold">{value.toLocaleString()}</span>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </Card>

            {/* Platform Stats */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Platform Stats</h2>
              <div className="space-y-4">
                {(['tiktok', 'facebook', 'instagram', 'youtube'] as const).map((platform) => {
                  const stats = platformStats[platform];
                  const platformAnalytics = summary.platformBreakdown[platform];
                  const isConnected = connections.some((c) => c.platform === platform);
                  
                  // Update with real YouTube data
                  const displayStats = platform === 'youtube' && youtubeAnalytics ? {
                    posts: youtubeAnalytics.channel.videoCount,
                    views: youtubeAnalytics.summary.totalViews,
                    engagement: youtubeAnalytics.summary.totalLikes + youtubeAnalytics.summary.totalComments,
                    engagementRate: youtubeAnalytics.summary.engagementRate / 100,
                  } : platformAnalytics;
                  
                  return (
                    <PlatformAnalyticsCard
                      key={platform}
                      platform={platform}
                      stats={displayStats}
                      isConnected={isConnected}
                      onRefresh={() => refreshPlatformAnalytics(platform)}
                      isLoading={isRefreshing && refreshedPlatform === platform}
                    />
                  );
                })}
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Insights</h2>
              <div className="space-y-3">
                {youtubeAnalytics?.performanceMetrics && (
                  <>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/20">
                      <Calendar className="w-5 h-5 text-[var(--color-accent)]" />
                      <div>
                        <p className="text-xs text-[var(--color-text-muted)]">Best Day to Post</p>
                        <p className="font-bold">{youtubeAnalytics.performanceMetrics.bestDay.day}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/20">
                      <Clock className="w-5 h-5 text-[var(--color-accent)]" />
                      <div>
                        <p className="text-xs text-[var(--color-text-muted)]">Best Hour to Post</p>
                        <p className="font-bold">{youtubeAnalytics.performanceMetrics.bestHour.hour}:00 - {youtubeAnalytics.performanceMetrics.bestHour.hour + 1}:00</p>
                      </div>
                    </div>
                  </>
                )}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-bg-secondary)]">
                  <Target className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)]">Avg Views/Video</p>
                    <p className="font-bold">{youtubeAnalytics?.summary?.avgViewsPerVideo.toLocaleString() || '0'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-bg-secondary)]">
                  <TrendingUpDown className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)]">Avg Likes/Video</p>
                    <p className="font-bold">{youtubeAnalytics?.summary?.avgLikesPerVideo.toLocaleString() || '0'}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </>
  );
}