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
import { subDays, format, eachDayOfInterval, subMonths, startOfMonth, endOfMonth, isAfter } from 'date-fns';
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
  totalFavorites?: number;
  totalDuration?: number;
  avgViewsPerVideo: number;
  avgLikesPerVideo?: number;
  avgCommentsPerVideo?: number;
  avgDurationSeconds?: number;
  engagementRate?: number;
  topVideo?: YouTubeVideo | null;
  worstVideo?: YouTubeVideo | null;
}

interface DateRangeOption {
  label: string;
  value: string;
  days: number | null;
}

// ============================================
// Line Chart Component (clean, no points, with tooltip)
// ============================================

interface LineChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  showArea?: boolean;
  smooth?: boolean;
  gradient?: string;
  valueLabel?: string;
}

function LineChart({ data, height = 200, showArea = true, smooth = true, gradient = 'var(--color-accent)', valueLabel = 'views' }: LineChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mouseX, setMouseX] = useState<number>(0);
  const [mouseY, setMouseY] = useState<number>(0);
  
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  
  const padding = { top: 15, right: 12, bottom: 30, left: 12 };
  const chartHeight = height - padding.top - padding.bottom;
  const chartWidth = 100 - padding.left - padding.right;
  const pointCount = data.length;
  
  // Normalize points to SVG viewBox (0-100 width, 0-height height)
  const getX = (index: number) => {
    if (pointCount <= 1) return padding.left + chartWidth / 2;
    return padding.left + (index / (pointCount - 1)) * chartWidth;
  };
  const getY = (value: number) => padding.top + chartHeight - ((value / maxValue) * chartHeight);
  
  // Generate smooth curve using cardinal spline or simple line
  const generatePath = (points: { x: number; y: number }[], tension: number = 0.4): string => {
    if (points.length < 2) return '';
    
    if (!smooth) {
      return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    }
    
    // Smooth curve using cardinal spline
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];
      
      const cp1x = p1.x + (p2.x - p0.x) * tension / 6;
      const cp1y = p1.y + (p2.y - p0.y) * tension / 6;
      const cp2x = p2.x - (p3.x - p1.x) * tension / 6;
      const cp2y = p2.y - (p3.y - p1.y) * tension / 6;
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    
    return path;
  };
  
  const points = data.map((item, idx) => ({
    x: getX(idx),
    y: getY(item.value),
    ...item
  }));
  
  const linePath = generatePath(points);
  const areaPath = showArea 
    ? `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`
    : linePath;
  
  // Calculate which label positions to show
  const labelStep = Math.max(1, Math.floor(pointCount / 6));
  const showLabel = (idx: number) => {
    if (pointCount <= 8) return true;
    return idx === 0 || idx === pointCount - 1 || idx % labelStep === 0;
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * 100;
    
    // Calculate which point is closest to mouse
    const relX = svgX - padding.left;
    const step = chartWidth / (pointCount - 1 || 1);
    let closestIdx = Math.round(relX / step);
    closestIdx = Math.max(0, Math.min(pointCount - 1, closestIdx));
    
    setMouseX(e.clientX - rect.left);
    setMouseY(e.clientY - rect.top);
    setHoveredIndex(closestIdx);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  return (
    <div className="relative" style={{ height }}>
      {/* Tooltip */}
      {hoveredIndex !== null && (
        <div 
          className="absolute z-10 px-2 py-1 text-xs bg-gray-900 text-white rounded shadow-lg pointer-events-none whitespace-nowrap"
          style={{ 
            left: mouseX + 10,
            top: mouseY - 40,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="font-semibold">{data[hoveredIndex]?.value.toLocaleString()}</div>
          <div className="text-gray-400 text-[10px]">{valueLabel}</div>
          <div className="text-gray-300 text-[10px] mt-0.5">{data[hoveredIndex]?.label}</div>
        </div>
      )}
      
      <svg 
        className="w-full h-full cursor-crosshair" 
        viewBox={`0 0 100 ${height}`} 
        preserveAspectRatio="none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient id="lineGradientFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={gradient} stopOpacity="0.4" />
            <stop offset="100%" stopColor={gradient} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Subtle horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <line
            key={ratio}
            x1={padding.left}
            y1={padding.top + chartHeight * (1 - ratio)}
            x2={padding.left + chartWidth}
            y2={padding.top + chartHeight * (1 - ratio)}
            stroke="var(--color-border)"
            strokeWidth="0.3"
            strokeDasharray="1"
          />
        ))}
        
        {/* Vertical hover indicator */}
        {hoveredIndex !== null && (
          <>
            <line
              x1={points[hoveredIndex].x}
              y1={padding.top}
              x2={points[hoveredIndex].x}
              y2={padding.top + chartHeight}
              stroke={gradient}
              strokeWidth="0.8"
              strokeDasharray="2"
              opacity="0.6"
            />
            {/* Clean dot on hover - perfectly round */}
            <circle
              cx={points[hoveredIndex].x}
              cy={points[hoveredIndex].y}
              r="1.2"
              fill={gradient}
              strokeWidth="0"
            />
          </>
        )}
        
        {/* Gradient area fill */}
        {showArea && (
          <path d={areaPath} fill="url(#lineGradientFill)" />
        )}
        
        {/* Smooth line */}
        <path
          d={linePath}
          fill="none"
          stroke={gradient}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      
      {/* Labels - positioned exactly at chart edges */}
      <div 
        className="absolute bottom-0 left-0 right-0 flex justify-between"
        style={{ paddingLeft: `${padding.left}%`, paddingRight: `${padding.right}%` }}
      >
        {data.map((item, idx) => {
          if (!showLabel(idx)) return <span key={idx} className="invisible" />;
          return (
            <span 
              key={idx} 
              className="text-[10px] text-[var(--color-text-muted)]"
            >
              {item.label}
            </span>
          );
        })}
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

function YouTubeStatsCard({ youtubeData }: { youtubeData: { videos: YouTubeVideo[], summary: YouTubeSummary, channelInfo?: any } | null }) {
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
    totalFavorites: youtubeData.summary.totalFavorites || 0,
    avgViews: youtubeData.summary.avgViewsPerVideo,
    avgLikes: youtubeData.summary.avgLikesPerVideo || 0,
    avgComments: youtubeData.summary.avgCommentsPerVideo || 0,
    avgDuration: youtubeData.summary.avgDurationSeconds || 0,
    engagementRate: youtubeData.summary.engagementRate || 0,
    subscribers: youtubeData.channelInfo?.subscribers || 0,
    channelViews: youtubeData.channelInfo?.totalViews || 0,
  };

  return (
    <Card className="p-6">
      <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
        <Video className="w-5 h-5 text-[#FF0000]" />
        YouTube Channel Stats
        {youtubeData.channelInfo?.title && (
          <span className="text-sm font-normal text-[var(--color-text-muted)]">
            - {youtubeData.channelInfo.title}
          </span>
        )}
      </h2>
      
      {/* Subscriber info if available */}
      {stats.subscribers > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-[#FF0000]/10 border border-[#FF0000]/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#FF0000]" />
              <span className="text-sm font-medium">Subscribers</span>
            </div>
            <span className="text-lg font-bold">{stats.subscribers.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between mt-2 text-sm text-[var(--color-text-secondary)]">
            <span>Channel views</span>
            <span>{stats.channelViews.toLocaleString()}</span>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-bg-secondary)]">
          <div className="p-2 rounded-full bg-[#FF0000]/10 text-[#FF0000]">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)]">Videos</p>
            <p className="text-lg font-bold">{stats.totalVideos.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-bg-secondary)]">
          <div className="p-2 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)]">Total Views</p>
            <p className="text-lg font-bold">{stats.totalViews.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-bg-secondary)]">
          <div className="p-2 rounded-full bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400">
            <ThumbsUp className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)]">Likes</p>
            <p className="text-lg font-bold">{stats.totalLikes.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-bg-secondary)]">
          <div className="p-2 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)]">Comments</p>
            <p className="text-lg font-bold">{stats.totalComments.toLocaleString()}</p>
          </div>
        </div>
      </div>
      
      {/* Averages and engagement rate */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-[var(--color-bg-secondary)] text-center">
          <p className="text-xs text-[var(--color-text-muted)]">Avg Views/Video</p>
          <p className="text-lg font-bold">{stats.avgViews.toLocaleString()}</p>
        </div>
        <div className="p-3 rounded-lg bg-[var(--color-bg-secondary)] text-center">
          <p className="text-xs text-[var(--color-text-muted)]">Avg Likes/Video</p>
          <p className="text-lg font-bold">{stats.avgLikes.toLocaleString()}</p>
        </div>
        <div className="p-3 rounded-lg bg-[var(--color-bg-secondary)] text-center">
          <p className="text-xs text-[var(--color-text-muted)]">Avg Comments/Video</p>
          <p className="text-lg font-bold">{stats.avgComments.toLocaleString()}</p>
        </div>
        <div className="p-3 rounded-lg bg-[var(--color-bg-secondary)] text-center">
          <p className="text-xs text-[var(--color-text-muted)]">Engagement Rate</p>
          <p className="text-lg font-bold">{(stats.engagementRate * 100).toFixed(2)}%</p>
        </div>
      </div>
      
      {/* Top performing video */}
      {youtubeData.summary.topVideo && (
        <div className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">🏆 Top Performing Video</p>
          <p className="font-medium text-sm truncate">{youtubeData.summary.topVideo.title}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            {youtubeData.summary.topVideo.stats.views.toLocaleString()} views
          </p>
        </div>
      )}
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
  const [youtubeData, setYoutubeData] = useState<{ videos: YouTubeVideo[], summary: YouTubeSummary, channelInfo?: any } | null>(null);
  const [youtubeAnalytics, setYoutubeAnalytics] = useState<any>(null);
  const [isLoadingYoutube, setIsLoadingYoutube] = useState(false);
  const fetchingRef = useRef(false);
  const analyticsRef = useRef(false);

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

  // Fetch YouTube analytics data (watch time, audience, etc.)
  const fetchYouTubeAnalytics = useCallback(async () => {
    if (analyticsRef.current) return;
    const isYouTubeConnected = connections.some((c) => c.platform === 'youtube');
    if (!isYouTubeConnected) return;
    
    analyticsRef.current = true;
    try {
      const response = await fetch('/api/analytics/youtube/analytics?refresh=true');
      const data = await response.json();
      console.log('YouTube Analytics response:', data);
      // Check if we have analytics data
      if (data.overview || data.demographics || data.trafficSources) {
        setYoutubeAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch YouTube analytics:', error);
    } finally {
      analyticsRef.current = false;
    }
  }, [connections]);

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
        setYoutubeData({ 
          videos: data.videos, 
          summary: data.summary,
          channelInfo: data.channelInfo 
        });
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
    fetchYouTubeAnalytics();
  }, [dateRange, fetchYouTubeData, fetchYouTubeAnalytics]);

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
    const days = dateRange === 'all' ? 365 : parseInt(dateRange);
    const startDate = subDays(new Date(), days);

    // Filter metrics by date range
    const filteredMetrics = dateRange === 'all'
      ? metrics
      : metrics.filter(m => isAfter(new Date(m.collectedAt), startDate) || new Date(m.collectedAt).getTime() === startDate.getTime());

    // Filter posts by date range
    const filteredPosts = dateRange === 'all'
      ? posts.filter((p) => p.status === 'published')
      : posts.filter((p) => {
          if (p.status !== 'published') return false;
          const publishedAt = new Date(p.publishedAt || p.createdAt);
          return isAfter(publishedAt, startDate) || publishedAt.getTime() === startDate.getTime();
        });

    const totalViews = filteredMetrics.reduce((sum, m) => sum + m.views, 0);
    const totalEngagement = filteredMetrics.reduce(
      (sum, m) => sum + m.likes + m.comments + m.shares,
      0
    );
    const avgEngagementRate =
      filteredMetrics.length > 0
        ? filteredMetrics.reduce((sum, m) => sum + m.engagementRate, 0) / filteredMetrics.length
        : 0;

    // Get YouTube data and filter by date range
    const ytVideos = youtubeData?.videos || [];
    const filteredYtVideos = dateRange === 'all'
      ? ytVideos
      : ytVideos.filter(v => {
          const publishedAt = new Date(v.publishedAt);
          return isAfter(publishedAt, startDate) || publishedAt.getTime() === startDate.getTime();
        });

    // Calculate YouTube stats from filtered videos
    const ytViews = filteredYtVideos.reduce((sum, v) => sum + (v.stats?.views || 0), 0);
    const ytLikes = filteredYtVideos.reduce((sum, v) => sum + (v.stats?.likes || 0), 0);
    const ytComments = filteredYtVideos.reduce((sum, v) => sum + (v.stats?.comments || 0), 0);

    // Calculate engagement rate from YouTube data
    const ytEngagementRate = ytViews > 0 ? (ytLikes + ytComments) / ytViews : 0;

    // Calculate posts per platform from filtered posts
    const tiktokPosts = filteredPosts.filter(p => p.platforms.includes('tiktok'));
    const facebookPosts = filteredPosts.filter(p => p.platforms.includes('facebook'));
    const instagramPosts = filteredPosts.filter(p => p.platforms.includes('instagram'));
    const youtubePosts = filteredPosts.filter(p => p.platforms.includes('youtube'));

    const platformBreakdown = {
      tiktok: { posts: tiktokPosts.length, views: 0, engagement: 0, engagementRate: 0 },
      facebook: { posts: facebookPosts.length, views: 0, engagement: 0, engagementRate: 0 },
      instagram: { posts: instagramPosts.length, views: 0, engagement: 0, engagementRate: 0 },
      youtube: {
        posts: filteredYtVideos.length + youtubePosts.length,
        views: ytViews,
        engagement: ytLikes + ytComments,
        engagementRate: ytEngagementRate
      },
    };

    // Combine total views from metrics and YouTube
    const combinedViews = totalViews > 0 ? totalViews + ytViews : ytViews;
    const combinedEngagement = totalEngagement > 0 ? totalEngagement + (ytLikes + ytComments) : (ytLikes + ytComments);

    return { 
      totalPosts: filteredPosts.length + filteredYtVideos.length, 
      totalViews: combinedViews, 
      totalEngagement: combinedEngagement, 
      averageEngagementRate: avgEngagementRate || ytEngagementRate, 
      platformBreakdown 
    };
  }, [metrics, posts, youtubeData, dateRange]);

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
              <LineChart data={viewsOverTimeData} height={250} showArea={true} />
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

            {/* YouTube Watch Time Chart */}
            {youtubeAnalytics && youtubeAnalytics.overview?.dailyData?.length > 0 && (
              <Card className="p-6">
                <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FF0000]" />
                  Watch Time (Last 30 Days)
                </h2>
                <LineChart 
                  data={youtubeAnalytics.overview.dailyData.map((d: any) => ({ 
                    label: d.date.slice(5), 
                    value: d.minutes 
                  }))} 
                  height={180} 
                  valueLabel="minutes"
                  gradient="#FF0000"
                />
                <div className="mt-2 text-center text-xs text-[var(--color-text-muted)]">
                  Total: {Math.round(youtubeAnalytics.overview.totalMinutesWatched / 60).toLocaleString()} hours watched
                </div>
              </Card>
            )}

            {/* YouTube Analytics Deep Dive */}
            {(youtubeAnalytics && (youtubeAnalytics.overview || youtubeAnalytics.demographics || youtubeAnalytics.trafficSources || youtubeAnalytics.topCountries)) && (
              <Card className="p-4">
                <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Video className="w-4 h-4 text-[#FF0000]" />
                  YouTube Analytics
                </h2>
                
                {/* Subscriber Changes */}
                {youtubeAnalytics.overview && (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-center">
                      <p className="text-[10px] text-green-600 dark:text-green-400">Subs +</p>
                      <p className="text-base font-bold text-green-600">{youtubeAnalytics.overview.subscribersGained?.toLocaleString() || 0}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-center">
                      <p className="text-[10px] text-red-600 dark:text-red-400">Subs -</p>
                      <p className="text-base font-bold text-red-600">{youtubeAnalytics.overview.subscribersLost?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                )}

                {/* Retention Bar */}
                {youtubeAnalytics.overview?.avgViewPercentage != null && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[var(--color-text-muted)]">Retention</span>
                      <span className="font-bold">{youtubeAnalytics.overview.avgViewPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="h-1 bg-[var(--color-bg-primary)] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#FF0000] rounded-full"
                        style={{ width: `${Math.min(youtubeAnalytics.overview.avgViewPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Age Demographics */}
                {youtubeAnalytics.demographics?.age?.length > 0 && (
                  <div className="mb-2">
                    <p className="text-[10px] font-medium text-[var(--color-text-muted)] mb-1">AGE</p>
                    <div className="space-y-0.5">
                      {youtubeAnalytics.demographics.age.slice(0, 4).map((item: any) => (
                        <div key={item.group} className="flex items-center justify-between text-xs">
                          <span className="text-[var(--color-text-secondary)]">{item.group}</span>
                          <div className="flex items-center gap-1">
                            <div className="w-10 h-1 bg-[var(--color-bg-primary)] rounded-full overflow-hidden">
                              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${item.percentage}%` }} />
                            </div>
                            <span className="text-[10px] text-[var(--color-text-muted)] w-6 text-right">{item.percentage.toFixed(0)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gender */}
                {youtubeAnalytics.demographics?.gender?.length > 0 && (
                  <div className="mb-2">
                    <p className="text-[10px] font-medium text-[var(--color-text-muted)] mb-1">GENDER</p>
                    <div className="flex gap-1">
                      {youtubeAnalytics.demographics.gender.map((item: any) => (
                        <div key={item.gender} className="flex-1 p-1 rounded bg-[var(--color-bg-secondary)] text-center">
                          <p className="text-[10px] capitalize text-[var(--color-text-muted)]">{item.gender}</p>
                          <p className="font-bold text-sm">{item.percentage.toFixed(0)}%</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Traffic Sources */}
                {youtubeAnalytics.trafficSources?.length > 0 && (
                  <div className="mb-2">
                    <p className="text-[10px] font-medium text-[var(--color-text-muted)] mb-1">TRAFFIC</p>
                    <div className="space-y-0.5">
                      {youtubeAnalytics.trafficSources.slice(0, 4).map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-[var(--color-text-secondary)] capitalize truncate mr-1">
                            {item.source.replace(/_/g, ' ').toLowerCase()}
                          </span>
                          <span className="font-medium shrink-0">{item.views?.toLocaleString() || 0}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Countries */}
                {youtubeAnalytics.topCountries?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-medium text-[var(--color-text-muted)] mb-1">COUNTRIES</p>
                    <div className="flex flex-wrap gap-1">
                      {youtubeAnalytics.topCountries.slice(0, 5).map((item: any, idx: number) => (
                        <span key={idx} className="px-1.5 py-0.5 text-[10px] rounded bg-[var(--color-bg-secondary)]">
                          {item.country}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}