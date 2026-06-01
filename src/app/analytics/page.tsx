'use client';

import { useState, useMemo, useCallback } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Heart,
  Download,
  RefreshCw,
  TrendingDown
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAnalyticsStore, usePostsStore, usePlatformStore } from '@/stores';
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

  const weeklyViewsData = [
    { label: 'Mon', value: 12400, color: '#0d9488' },
    { label: 'Tue', value: 15800, color: '#0d9488' },
    { label: 'Wed', value: 11200, color: '#0d9488' },
    { label: 'Thu', value: 18900, color: '#0d9488' },
    { label: 'Fri', value: 22100, color: '#0d9488' },
    { label: 'Sat', value: 28500, color: '#0d9488' },
    { label: 'Sun', value: 19400, color: '#0d9488' },
  ];

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
                <span>Total: {weeklyViewsData.reduce((a, b) => a + b.value, 0).toLocaleString()} views</span>
                <span className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  +18% vs last week
                </span>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Platform Comparison</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { platform: 'tiktok', rate: 8.5 },
                  { platform: 'facebook', rate: 4.2 },
                  { platform: 'instagram', rate: 6.8 },
                  { platform: 'youtube', rate: 5.1 },
                ].map(({ platform, rate }) => (
                  <div 
                    key={platform}
                    className="p-4 rounded-lg bg-[var(--color-bg-secondary)]"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium capitalize">{platform}</span>
                      <span className={clsx(
                        'text-sm font-semibold',
                        rate > 6 ? 'text-green-600' : rate > 4 ? 'text-amber-600' : 'text-[var(--color-text-secondary)]'
                      )}>
                        {rate}%
                      </span>
                    </div>
                    <div className="h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
                      <div 
                        className={clsx(
                          'h-full rounded-full transition-all',
                          platform === 'tiktok' && 'bg-black',
                          platform === 'facebook' && 'bg-[#1877F2]',
                          platform === 'instagram' && 'bg-gradient-to-r from-[#833ab4] to-[#fd1d1d]',
                          platform === 'youtube' && 'bg-[#FF0000]'
                        )}
                        style={{ width: `${Math.min(rate * 10, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mt-2">
                      Engagement Rate
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Engagement Breakdown</h2>
              <div className="space-y-3">
                {[
                  { label: 'Likes', value: 6500, color: '#E4405F' },
                  { label: 'Comments', value: 1500, color: '#2563EB' },
                  { label: 'Shares', value: 2000, color: '#16A34A' },
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
                ))}
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