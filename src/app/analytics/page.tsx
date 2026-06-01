'use client';

import { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Heart,
  Download
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAnalyticsStore, usePostsStore, usePlatformStore } from '@/stores';
import { Sidebar, Header, MobileSidebar, PageHeader, StatsCard, Section } from '@/components/dashboard/Layout';

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
// Analytics Dashboard Page
// ============================================

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('7');
  const [activeSection, setActiveSection] = useState('analytics');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const analyticsStore = useAnalyticsStore();
  const postsStore = usePostsStore();
  const platformStore = usePlatformStore();

  const days = parseInt(dateRange);
  const summary = analyticsStore.getSummary(days);

  const weeklyViewsData = [
    { label: 'Mon', value: 12400, color: '#0d9488' },
    { label: 'Tue', value: 15800, color: '#0d9488' },
    { label: 'Wed', value: 11200, color: '#0d9488' },
    { label: 'Thu', value: 18900, color: '#0d9488' },
    { label: 'Fri', value: 22100, color: '#0d9488' },
    { label: 'Sat', value: 28500, color: '#0d9488' },
    { label: 'Sun', value: 19400, color: '#0d9488' },
  ];

  const engagementData = [
    { label: 'Likes', value: summary.totalEngagement * 0.65, color: '#E4405F' },
    { label: 'Comments', value: summary.totalEngagement * 0.15, color: '#2563EB' },
    { label: 'Shares', value: summary.totalEngagement * 0.20, color: '#16A34A' },
  ];

  const platformEngagement = [
    { platform: 'tiktok', rate: 8.5 },
    { platform: 'facebook', rate: 4.2 },
    { platform: 'instagram', rate: 6.8 },
    { platform: 'youtube', rate: 5.1 },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex">
      <Sidebar 
        activeItem={activeSection} 
        onItemClick={setActiveSection} 
      />
      
      <MobileSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        activeItem={activeSection}
        onItemClick={setActiveSection}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-6 overflow-auto">
          <PageHeader 
            title="Analytics" 
            description="Track your content performance"
            actions={
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-[var(--color-bg-card)] rounded-lg border border-[var(--color-border)] p-1">
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
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] transition-colors">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            }
          />

          {/* Overview Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              label="Total Views"
              value={summary.totalViews.toLocaleString()}
              icon={<Eye className="w-5 h-5" />}
              change={{ value: 23, positive: true }}
            />
            <StatsCard
              label="Total Engagement"
              value={summary.totalEngagement.toLocaleString()}
              icon={<Heart className="w-5 h-5" />}
              change={{ value: 15, positive: true }}
            />
            <StatsCard
              label="Avg. Engagement Rate"
              value={`${(summary.averageEngagementRate * 100).toFixed(2)}%`}
              icon={<TrendingUp className="w-5 h-5" />}
              change={{ value: 8, positive: true }}
            />
            <StatsCard
              label="Posts Published"
              value={summary.totalPosts}
              icon={<BarChart3 className="w-5 h-5" />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Charts */}
            <div className="lg:col-span-2 space-y-6">
              <Section title="Views Over Time" noPadding>
                <div className="p-6 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)]">
                  <BarChart data={weeklyViewsData} height={250} />
                  <div className="flex items-center justify-between mt-4 text-sm text-[var(--color-text-muted)]">
                    <span>Total: {(weeklyViewsData.reduce((a, b) => a + b.value, 0)).toLocaleString()} views</span>
                    <span className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="w-4 h-4" />
                      +18% vs last week
                    </span>
                  </div>
                </div>
              </Section>

              <Section title="Platform Comparison">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {platformEngagement.map(({ platform, rate }) => (
                    <div 
                      key={platform}
                      className="p-4 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
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
              </Section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Section title="Engagement Breakdown">
                <div className="space-y-3">
                  {engagementData.map(({ label, value, color }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm">{label}</span>
                      </div>
                      <span className="font-medium">{Math.round(value).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="Platform Stats">
                <div className="space-y-4">
                  {(['tiktok', 'facebook', 'instagram', 'youtube'] as const).map((platform) => {
                    const stats = platformStore.platformStats[platform];
                    const platformAnalytics = summary.platformBreakdown[platform];
                    
                    return (
                      <div 
                        key={platform}
                        className="p-3 rounded-lg bg-[var(--color-bg-secondary)]"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className={clsx(
                            'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold',
                            platform === 'tiktok' && 'bg-black',
                            platform === 'facebook' && 'bg-[#1877F2]',
                            platform === 'instagram' && 'bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045]',
                            platform === 'youtube' && 'bg-[#FF0000]'
                          )}>
                            {platform.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium capitalize">{platform}</p>
                            {stats?.followers && (
                              <p className="text-xs text-[var(--color-text-muted)]">
                                {stats.followers.toLocaleString()} followers
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <p className="text-lg font-semibold">{platformAnalytics.posts}</p>
                            <p className="text-xs text-[var(--color-text-muted)]">Posts</p>
                          </div>
                          <div>
                            <p className="text-lg font-semibold">{platformAnalytics.views.toLocaleString()}</p>
                            <p className="text-xs text-[var(--color-text-muted)]">Views</p>
                          </div>
                          <div>
                            <p className="text-lg font-semibold">{platformAnalytics.engagementRate.toFixed(1)}%</p>
                            <p className="text-xs text-[var(--color-text-muted)]">ER</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Section>

              <Section title="Top Performing Post">
                {summary.topPerformingPost ? (
                  <div className="p-4 rounded-lg bg-[var(--color-bg-secondary)]">
                    <p className="text-sm line-clamp-2 mb-3">
                      {summary.topPerformingPost.content || 'No content'}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4 text-[var(--color-text-muted)]" />
                        12.5K
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4 text-red-500" />
                        1.2K
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--color-text-muted)]">
                    No posts yet. Create your first post to see analytics!
                  </p>
                )}
              </Section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}