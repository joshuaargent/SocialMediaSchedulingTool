'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar as CalendarIcon, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Eye,
  Heart,
  Video,
  Image,
  Plus
} from 'lucide-react';
import { format, isToday, isTomorrow, subDays, isAfter } from 'date-fns';
import { clsx } from 'clsx';
import { usePostsStore, usePlatformStore } from '@/stores';
import { Container } from '@/components/layout/Container';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PostCard, PlatformPills } from '@/components/dashboard/PostCard';
import { Calendar } from '@/components/calendar/Calendar';
import { PostComposer } from '@/components/compose/PostComposer';

// ============================================
// Auth Check Component
// ============================================

function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    fetch('/api/auth/status')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.approved) {
          setIsAuthenticated(true);
          setChecking(false);
        } else if (data.authenticated && !data.approved) {
          router.push('/pending');
        } else {
          router.push('/login');
        }
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

// ============================================
// Main Dashboard Page
// ============================================

export default function DashboardPage() {
  return (
    <AuthCheck>
      <DashboardContent />
    </AuthCheck>
  );
}

function DashboardContent() {
  const [showComposer, setShowComposer] = useState(false);
  const [youtubeVideos, setYoutubeVideos] = useState<any[]>([]);
  const [youtubeStats, setYoutubeStats] = useState<{ subscribers: number; totalViews: number; totalVideos: number } | null>(null);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [dashboardDateRange, setDashboardDateRange] = useState('30');
  const router = useRouter();

  const dashboardDateRangeOptions = [
    { label: '7d', value: '7' },
    { label: '14d', value: '14' },
    { label: '30d', value: '30' },
    { label: '90d', value: '90' },
    { label: 'All', value: 'all' },
  ];

  // Calculate date range for filtering
  const days = dashboardDateRange === 'all' ? 365 : parseInt(dashboardDateRange);
  const startDate = subDays(new Date(), days);

  // Use selectors to get raw state
  const posts = usePostsStore((state) => state.posts);
  const platformConnections = usePlatformStore((state) => state.connections);
  const platformStats = usePlatformStore((state) => state.platformStats);

  // Fetch YouTube videos and stats on page load and when date range changes
  useEffect(() => {
    setLoadingVideos(true);
    
    const daysParam = dashboardDateRange === 'all' ? 365 : parseInt(dashboardDateRange);

    Promise.all([
      fetch('/api/analytics/youtube/stats').then(r => r.json()),
      fetch(`/api/analytics/youtube/videos?refresh=true&days=${daysParam}`).then(r => r.json()),
    ])
      .then(([statsData, videosData]) => {
        console.log('YouTube stats:', statsData);
        console.log('YouTube videos:', videosData);
        
        // Store YouTube stats for display
        if (statsData.connected && statsData.stats) {
          setYoutubeStats({
            subscribers: statsData.stats.subscribers || 0,
            totalViews: statsData.stats.totalViews || 0,
            totalVideos: statsData.stats.totalVideos || 0,
          });
          
          // Update platform store with stats
          const existingStats = platformStats['youtube'];
          usePlatformStore.getState().updateStats('youtube', {
            platform: 'youtube',
            followers: statsData.stats.subscribers || existingStats?.followers || 0,
            following: existingStats?.following || 0,
            posts: statsData.stats.totalVideos || existingStats?.posts || 0,
            totalViews: statsData.stats.totalViews || 0,
            totalPosts: statsData.stats.totalVideos || 0,
            lastUpdated: new Date(),
          });
        }
        
        // Update videos if we got any
        if (videosData.videos && videosData.videos.length > 0) {
          setYoutubeVideos(videosData.videos);
          
          // If no stats, calculate from videos
          if (!statsData.connected && videosData.summary) {
            const summary = videosData.summary;
            setYoutubeStats({
              subscribers: 0,
              totalViews: summary.totalViews || 0,
              totalVideos: summary.totalVideos || 0,
            });
          }
        }
      })
      .catch((err) => console.error('Failed to fetch YouTube data:', err))
      .finally(() => setLoadingVideos(false));
  }, [dashboardDateRange]);

  // Filter YouTube videos by date range
  const filteredYoutubeVideos = useMemo(() => {
    if (dashboardDateRange === 'all') return youtubeVideos;
    
    return youtubeVideos.filter(video => {
      const publishedAt = new Date(video.publishedAt);
      return isAfter(publishedAt, startDate) || publishedAt.getTime() === startDate.getTime();
    });
  }, [youtubeVideos, startDate, dashboardDateRange]);

  // Calculate filtered stats from YouTube videos
  const filteredYoutubeStats = useMemo(() => {
    const videos = filteredYoutubeVideos;
    
    if (videos.length === 0) {
      return {
        totalViews: youtubeStats?.totalViews || 0,
        totalVideos: youtubeStats?.totalVideos || 0,
      };
    }
    
    const totalViews = videos.reduce((sum, v) => sum + (v.stats?.views || 0), 0);
    const totalLikes = videos.reduce((sum, v) => sum + (v.stats?.likes || 0), 0);
    const totalComments = videos.reduce((sum, v) => sum + (v.stats?.comments || 0), 0);
    
    return {
      totalViews,
      totalVideos: videos.length,
      totalLikes,
      totalComments,
    };
  }, [filteredYoutubeVideos, youtubeStats]);

  // Compute scheduled posts (within date range)
  const scheduledPosts = useMemo(() => {
    return posts.filter((p) => {
      if (p.status !== 'scheduled') return false;
      if (dashboardDateRange === 'all') return true;
      const scheduledAt = new Date(p.scheduledAt || p.createdAt);
      return isAfter(scheduledAt, startDate) || scheduledAt.getTime() === startDate.getTime();
    });
  }, [posts, startDate, dashboardDateRange]);

  // Compute published posts (within date range)
  const publishedPosts = useMemo(() => {
    return posts.filter((p) => {
      if (p.status !== 'published') return false;
      if (dashboardDateRange === 'all') return true;
      const publishedAt = new Date(p.publishedAt || p.createdAt);
      return isAfter(publishedAt, startDate) || publishedAt.getTime() === startDate.getTime();
    });
  }, [posts, startDate, dashboardDateRange]);

  // Convert filtered YouTube videos to calendar events
  const videoCalendarEvents = useMemo(() => {
    return filteredYoutubeVideos.map((video) => ({
      id: video.id,
      title: video.title,
      date: new Date(video.publishedAt),
      type: 'video' as const,
      thumbnail: video.thumbnail,
      stats: video.stats,
    }));
  }, [filteredYoutubeVideos]);

  // Compute calendar events (posts + videos)
  const calendarEvents = useMemo(() => {
    // Filter posts by date range if not "all"
    const filteredPosts = dashboardDateRange === 'all' 
      ? posts 
      : posts.filter(p => {
          const date = new Date(p.scheduledAt || p.publishedAt || p.createdAt);
          return isAfter(date, startDate) || date.getTime() === startDate.getTime();
        });
    
    const postEvents = filteredPosts.map((post) => ({
      id: post.id,
      title: post.content.slice(0, 50) + (post.content.length > 50 ? '...' : ''),
      date: post.scheduledAt || post.publishedAt || post.createdAt,
      type: 'post' as const,
      status: post.status,
      platforms: post.platforms,
      postId: post.id,
    }));

    const videoEvents = videoCalendarEvents.map((event) => ({
      ...event,
      date: new Date(event.date),
    }));

    return [...postEvents, ...videoEvents];
  }, [posts, videoCalendarEvents, startDate, dashboardDateRange]);

  // Get today's and tomorrow's posts
  const todaysPosts = useMemo(() => {
    return scheduledPosts.filter((p) => {
      if (!p.scheduledAt) return false;
      return isToday(new Date(p.scheduledAt));
    });
  }, [scheduledPosts]);

  const tomorrowsPosts = useMemo(() => {
    return scheduledPosts.filter((p) => {
      if (!p.scheduledAt) return false;
      return isTomorrow(new Date(p.scheduledAt));
    });
  }, [scheduledPosts]);

  // Get connected platforms
  const connectedPlatforms = useMemo(() => {
    return platformConnections.map((c) => c.platform);
  }, [platformConnections]);

  return (
    <>
      <PageHeader 
        title="Dashboard" 
        description="Your content command center"
        align="left"
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-[var(--color-bg-card)] rounded-lg border border-[var(--color-border)] p-1">
              {dashboardDateRangeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDashboardDateRange(option.value)}
                  className={clsx(
                    'px-3 py-1.5 text-sm rounded-md transition-colors',
                    dashboardDateRange === option.value
                      ? 'bg-[var(--color-accent)] text-white'
                      : 'hover:bg-[var(--color-bg-secondary)]'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <Button
              variant="primary"
              onClick={() => setShowComposer(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Create Post
            </Button>
          </div>
        }
      />

      <Container>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">Published</p>
                <p className="text-2xl font-bold">{publishedPosts.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">Scheduled</p>
                <p className="text-2xl font-bold">{scheduledPosts.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">Views</p>
                <p className="text-2xl font-bold">
                  {youtubeStats?.totalViews 
                    ? filteredYoutubeStats.totalViews.toLocaleString() 
                    : (platformStats.youtube?.totalViews || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">Subscribers</p>
                <p className="text-2xl font-bold">
                  {youtubeStats?.subscribers 
                    ? youtubeStats.subscribers.toLocaleString() 
                    : (platformStats.youtube?.followers || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Calendar */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Content Calendar</h2>
              <Calendar 
                events={calendarEvents}
                onDateClick={() => setShowComposer(true)}
              />
            </Card>

            {/* Platform Performance */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Platform Performance</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(['tiktok', 'facebook', 'instagram', 'youtube'] as const).map((platform) => {
                  const platformPosts = publishedPosts.filter(p => p.platforms.includes(platform));
                  return (
                    <div 
                      key={platform}
                      className="p-4 rounded-lg bg-[var(--color-bg-secondary)] text-center"
                    >
                      <div className={clsx(
                        'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3',
                        platform === 'tiktok' && 'bg-black',
                        platform === 'facebook' && 'bg-[#1877F2]',
                        platform === 'instagram' && 'bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045]',
                        platform === 'youtube' && 'bg-[#FF0000]'
                      )}>
                        {platform.charAt(0).toUpperCase()}
                      </div>
                      <p className="font-medium capitalize mb-1">{platform}</p>
                      <p className="text-2xl font-bold">{platformPosts.length}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">posts</p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Button
                  variant="primary"
                  className="w-full justify-start"
                  onClick={() => setShowComposer(true)}
                  leftIcon={<Video className="w-4 h-4" />}
                >
                  Create New Post
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  leftIcon={<Image className="w-4 h-4" />}
                >
                  Upload Media
                </Button>
              </div>
            </Card>

            {/* Upcoming Posts */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Upcoming Posts</h2>
              <div className="space-y-3">
                {todaysPosts.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase mb-2">Today</p>
                    {todaysPosts.slice(0, 2).map((post) => (
                      <PostCard key={post.id} post={post} compact />
                    ))}
                  </div>
                )}
                
                {tomorrowsPosts.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase mb-2">Tomorrow</p>
                    {tomorrowsPosts.slice(0, 2).map((post) => (
                      <PostCard key={post.id} post={post} compact />
                    ))}
                  </div>
                )}

                {scheduledPosts.length === 0 && (
                  <div className="text-center py-6">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-[var(--color-text-muted)]" />
                    <p className="text-sm text-[var(--color-text-secondary)]">No scheduled posts</p>
                    <button
                      onClick={() => setShowComposer(true)}
                      className="mt-2 text-sm text-[var(--color-accent)] hover:underline"
                    >
                      Schedule your first post
                    </button>
                  </div>
                )}
              </div>
            </Card>

            {/* Platform Connections */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Platform Connections</h2>
              <div className="space-y-3">
                {(['tiktok', 'facebook', 'instagram', 'youtube'] as const).map((platform) => {
                  const isConnected = connectedPlatforms.includes(platform);
                  const stats = platformStats[platform];
                  
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
                            {stats && (
                              <span className="ml-1">
                                • {(stats.followers || 0).toLocaleString()} followers
                                {(stats.totalViews || 0) > 0 && ` • ${((stats.totalViews || 0) / 1000000).toFixed(1)}M views`}
                                {(stats.totalPosts || stats.posts || 0) > 0 && ` • ${(stats.totalPosts || stats.posts || 0)} posts`}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      {!isConnected && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => router.push('/settings')}
                        >
                          Connect
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </Container>

      {showComposer && (
        <PostComposer 
          onClose={() => setShowComposer(false)}
        />
      )}
    </>
  );
}