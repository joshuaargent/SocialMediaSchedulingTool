'use client';

import { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Heart,
  Video,
  Image
} from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';
import { clsx } from 'clsx';
import { usePostsStore, useAnalyticsStore, usePlatformStore } from '@/stores';
import { Sidebar, Header, MobileSidebar, PageHeader, StatsCard, Section } from '@/components/dashboard/Layout';
import { PostCard, PlatformPills } from '@/components/dashboard/PostCard';
import { Calendar } from '@/components/calendar/Calendar';
import { PostComposer } from '@/components/compose/PostComposer';

// ============================================
// Main Dashboard Page
// ============================================

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showComposer, setShowComposer] = useState(false);

  const postsStore = usePostsStore();
  const analyticsStore = useAnalyticsStore();
  const platformStore = usePlatformStore();

  const scheduledPosts = postsStore.getScheduledPosts();
  const publishedPosts = postsStore.getPublishedPosts();
  const calendarEvents = postsStore.getCalendarEvents();
  const summary = analyticsStore.getSummary(7);

  const todaysPosts = scheduledPosts.filter((p) => {
    if (!p.scheduledAt) return false;
    return isToday(new Date(p.scheduledAt));
  });

  const tomorrowsPosts = scheduledPosts.filter((p) => {
    if (!p.scheduledAt) return false;
    return isTomorrow(new Date(p.scheduledAt));
  });

  const queueWithCooldowns = postsStore.getQueueWithCooldowns();

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
        <Header 
          onMenuClick={() => setSidebarOpen(true)}
          onComposeClick={() => setShowComposer(true)}
        />

        <main className="flex-1 p-6 overflow-auto">
          <PageHeader 
            title="Dashboard" 
            description="Your content command center"
            actions={
              <button
                onClick={() => setShowComposer(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
              >
                <Video className="w-4 h-4" />
                Create Post
              </button>
            }
          />

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              label="Published This Week"
              value={publishedPosts.length}
              icon={<CheckCircle className="w-5 h-5" />}
              change={{ value: 12, positive: true }}
            />
            <StatsCard
              label="Scheduled Posts"
              value={scheduledPosts.length}
              icon={<CalendarIcon className="w-5 h-5" />}
            />
            <StatsCard
              label="Total Views"
              value={summary.totalViews.toLocaleString()}
              icon={<Eye className="w-5 h-5" />}
              change={{ value: 8, positive: true }}
            />
            <StatsCard
              label="Avg. Engagement"
              value={`${(summary.averageEngagementRate * 100).toFixed(1)}%`}
              icon={<Heart className="w-5 h-5" />}
              change={{ value: 3, positive: false }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <Section title="Content Calendar" noPadding>
                <Calendar 
                  events={calendarEvents}
                  onDateClick={() => setShowComposer(true)}
                />
              </Section>

              <Section title="Platform Performance (7 days)">
                <div className="grid grid-cols-2 gap-4">
                  {(['tiktok', 'facebook', 'instagram', 'youtube'] as const).map((platform) => {
                    const platformStats = summary.platformBreakdown[platform];
                    return (
                      <div 
                        key={platform}
                        className="p-4 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div className={clsx(
                            'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold',
                            platform === 'tiktok' && 'bg-black',
                            platform === 'facebook' && 'bg-[#1877F2]',
                            platform === 'instagram' && 'bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045]',
                            platform === 'youtube' && 'bg-[#FF0000]'
                          )}>
                            {platform.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium capitalize">{platform}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-[var(--color-text-muted)]">Posts</p>
                            <p className="text-lg font-semibold">{platformStats.posts}</p>
                          </div>
                          <div>
                            <p className="text-xs text-[var(--color-text-muted)]">Views</p>
                            <p className="text-lg font-semibold">{platformStats.views.toLocaleString()}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-xs text-[var(--color-text-muted)]">Engagement</p>
                            <p className="text-lg font-semibold">{platformStats.engagement.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Section>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <Section title="Upcoming Posts">
                <div className="space-y-3">
                  {todaysPosts.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
                        Today
                      </h4>
                      {todaysPosts.slice(0, 3).map((post) => (
                        <PostCard key={post.id} post={post} compact />
                      ))}
                    </div>
                  )}
                  
                  {tomorrowsPosts.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
                        Tomorrow
                      </h4>
                      {tomorrowsPosts.slice(0, 3).map((post) => (
                        <PostCard key={post.id} post={post} compact />
                      ))}
                    </div>
                  )}

                  {scheduledPosts.length === 0 && (
                    <div className="text-center py-8">
                      <Clock className="w-10 h-10 mx-auto mb-3 text-[var(--color-text-muted)]" />
                      <p className="text-[var(--color-text-secondary)]">No scheduled posts</p>
                      <button
                        onClick={() => setShowComposer(true)}
                        className="mt-3 text-sm text-[var(--color-accent)] hover:underline"
                      >
                        Schedule your first post
                      </button>
                    </div>
                  )}
                </div>
              </Section>

              {queueWithCooldowns.length > 0 && (
                <Section title="Cooldown Queue">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span className="text-sm text-amber-800 dark:text-amber-200">
                        Some posts are waiting for cooldown period
                      </span>
                    </div>
                    {queueWithCooldowns.slice(0, 5).map((post) => (
                      <div 
                        key={post.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-bg-secondary)]"
                      >
                        <PlatformPills platforms={post.platforms} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{post.content || 'No content'}</p>
                          <p className="text-xs text-amber-600">
                            Cooldown: {Math.ceil(post.cooldownRemaining / 60000)} min
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              <Section title="Quick Actions">
                <div className="space-y-2">
                  <button
                    onClick={() => setShowComposer(true)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
                  >
                    <Video className="w-5 h-5" />
                    Create New Post
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-border)] transition-colors">
                    <Image className="w-5 h-5" />
                    Upload Media
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-border)] transition-colors">
                    <TrendingUp className="w-5 h-5" />
                    View Analytics
                  </button>
                </div>
              </Section>

              <Section title="Platform Connections">
                <div className="space-y-3">
                  {(['tiktok', 'facebook', 'instagram', 'youtube'] as const).map((platform) => {
                    const isConnected = platformStore.isPlatformConnected(platform);
                    const stats = platformStore.platformStats[platform];
                    
                    return (
                      <div 
                        key={platform}
                        className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-bg-secondary)]"
                      >
                        <div className="flex items-center gap-3">
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
                            <p className="text-xs text-[var(--color-text-muted)]">
                              {isConnected ? 'Connected' : 'Not connected'}
                              {stats?.followers && ` • ${stats.followers.toLocaleString()} followers`}
                            </p>
                          </div>
                        </div>
                        {!isConnected && (
                          <button className="text-sm text-[var(--color-accent)] hover:underline">
                            Connect
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Section>
            </div>
          </div>
        </main>
      </div>

      {showComposer && (
        <PostComposer 
          onClose={() => setShowComposer(false)}
        />
      )}
    </div>
  );
}