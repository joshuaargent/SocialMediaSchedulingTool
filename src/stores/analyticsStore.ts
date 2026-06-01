import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { subDays, isAfter, isBefore, startOfDay } from 'date-fns';
import type { 
  PerformanceMetrics, 
  AnalyticsSummary, 
  PlatformAnalytics, 
  SocialPlatform,
  EngagementMetrics,
  AlgorithmHealth,
  AlgorithmIssue,
  Post
} from '@/types';
import { usePostsStore } from './postsStore';

// ============================================
// Analytics Store
// ============================================

interface AnalyticsState {
  metrics: PerformanceMetrics[];
  algorithmHealth: Record<SocialPlatform, AlgorithmHealth | null>;
  lastUpdated: Date | null;
  
  // Getters
  getMetricsForPost: (postId: string) => PerformanceMetrics[];
  getMetricsForPlatform: (platform: SocialPlatform) => PerformanceMetrics[];
  getSummary: (days?: number) => AnalyticsSummary;
  getPlatformAnalytics: (platform: SocialPlatform, days?: number) => PlatformAnalytics;
  getAlgorithmHealth: (platform: SocialPlatform) => AlgorithmHealth | null;
  
  // Actions
  addMetrics: (metrics: Omit<PerformanceMetrics, 'id' | 'collectedAt'>) => void;
  updateAlgorithmHealth: (health: AlgorithmHealth) => void;
  refreshAnalytics: () => void;
}

// Generate mock engagement data for demo purposes
function generateMockEngagement(): EngagementMetrics {
  const views = Math.floor(Math.random() * 50000) + 1000;
  const engagementRate = Math.random() * 0.15 + 0.02;
  const engagement = Math.floor(views * engagementRate);
  
  return {
    views,
    likes: Math.floor(engagement * 0.7),
    comments: Math.floor(engagement * 0.15),
    shares: Math.floor(engagement * 0.15),
    saves: Math.floor(engagement * 0.1),
    reach: Math.floor(views * (Math.random() * 0.5 + 0.5)),
    impressions: views * Math.floor(Math.random() * 3 + 1),
  };
}

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set, get) => ({
      metrics: [],
      algorithmHealth: {
        tiktok: null,
        facebook: null,
        instagram: null,
        youtube: null,
      },
      lastUpdated: null,

      getMetricsForPost: (postId) =>
        get().metrics.filter((m) => m.postId === postId),

      getMetricsForPlatform: (platform) =>
        get().metrics.filter((m) => m.platform === platform),

      getSummary: (days = 30) => {
        const startDate = subDays(new Date(), days);
        const postsStore = usePostsStore.getState();
        const publishedPosts = postsStore
          .getPublishedPosts()
          .filter((p) => p.publishedAt && isAfter(p.publishedAt, startDate));
        
        const metrics = get().metrics.filter(
          (m) => isAfter(m.collectedAt, startDate)
        );

        const totalViews = metrics.reduce((sum, m) => sum + m.views, 0);
        const totalEngagement = metrics.reduce(
          (sum, m) => sum + m.likes + m.comments + m.shares,
          0
        );
        const avgEngagementRate =
          metrics.length > 0
            ? metrics.reduce((sum, m) => sum + m.engagementRate, 0) / metrics.length
            : 0;

        const platformBreakdown: Record<SocialPlatform, PlatformAnalytics> = {
          tiktok: { posts: 0, views: 0, engagement: 0, engagementRate: 0 },
          facebook: { posts: 0, views: 0, engagement: 0, engagementRate: 0 },
          instagram: { posts: 0, views: 0, engagement: 0, engagementRate: 0 },
          youtube: { posts: 0, views: 0, engagement: 0, engagementRate: 0 },
        };

        for (const platform of ['tiktok', 'facebook', 'instagram', 'youtube'] as SocialPlatform[]) {
          const platformMetrics = metrics.filter((m) => m.platform === platform);
          const platformPosts = publishedPosts.filter((p) => p.platforms.includes(platform));
          
          platformBreakdown[platform] = {
            posts: platformPosts.length,
            views: platformMetrics.reduce((sum, m) => sum + m.views, 0),
            engagement: platformMetrics.reduce(
              (sum, m) => sum + m.likes + m.comments + m.shares,
              0
            ),
            engagementRate:
              platformMetrics.length > 0
                ? platformMetrics.reduce((sum, m) => sum + m.engagementRate, 0) /
                  platformMetrics.length
                : 0,
          };
        }

        return {
          totalPosts: publishedPosts.length,
          totalViews,
          totalEngagement,
          averageEngagementRate: avgEngagementRate,
          platformBreakdown,
        };
      },

      getPlatformAnalytics: (platform, days = 30) => {
        const startDate = subDays(new Date(), days);
        const metrics = get().metrics.filter(
          (m) => m.platform === platform && isAfter(m.collectedAt, startDate)
        );

        return {
          posts: metrics.length,
          views: metrics.reduce((sum, m) => sum + m.views, 0),
          engagement: metrics.reduce(
            (sum, m) => sum + m.likes + m.comments + m.shares,
            0
          ),
          engagementRate:
            metrics.length > 0
              ? metrics.reduce((sum, m) => sum + m.engagementRate, 0) / metrics.length
              : 0,
        };
      },

      getAlgorithmHealth: (platform) => get().algorithmHealth[platform],

      addMetrics: (metricsData) => {
        const newMetrics: PerformanceMetrics = {
          ...metricsData,
          id: `${metricsData.postId}-${metricsData.platform}-${Date.now()}`,
          collectedAt: new Date(),
        };
        set((state) => ({
          metrics: [...state.metrics, newMetrics],
          lastUpdated: new Date(),
        }));
      },

      updateAlgorithmHealth: (health) =>
        set((state) => ({
          algorithmHealth: {
            ...state.algorithmHealth,
            [health.platform]: health,
          },
        })),

      refreshAnalytics: () => {
        // Simulate fetching fresh analytics from platforms
        set({ lastUpdated: new Date() });
      },
    }),
    {
      name: 'analytics-storage',
    }
  )
);

// ============================================
// Algorithm Health Analyzer
// ============================================

export function analyzeAlgorithmHealth(
  platform: SocialPlatform,
  metrics: PerformanceMetrics[],
  postingHistory: { platform: SocialPlatform; publishedAt: Date }[]
): AlgorithmHealth {
  const platformMetrics = metrics.filter((m) => m.platform === platform);
  const platformHistory = postingHistory.filter((h) => h.platform === platform);
  
  // Calculate posting frequency score (penalize inconsistent posting)
  let postingFrequencyScore = 100;
  if (platformHistory.length > 1) {
    const intervals = [];
    const sorted = [...platformHistory].sort(
      (a, b) => a.publishedAt.getTime() - b.publishedAt.getTime()
    );
    for (let i = 1; i < sorted.length; i++) {
      intervals.push(
        (sorted[i].publishedAt.getTime() - sorted[i - 1].publishedAt.getTime()) /
          (1000 * 60 * 60)
      );
    }
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce(
      (sum, i) => sum + Math.pow(i - avgInterval, 2),
      0
    ) / intervals.length;
    const stdDev = Math.sqrt(variance);
    
    // Higher variance = lower score
    postingFrequencyScore = Math.max(0, 100 - stdDev * 2);
  }

  // Calculate engagement score
  let engagementScore = 50;
  if (platformMetrics.length > 0) {
    const avgEngagement = platformMetrics.reduce((sum, m) => sum + m.engagementRate, 0) / platformMetrics.length;
    engagementScore = Math.min(100, avgEngagement * 1000); // Scale to 0-100
  }

  // Calculate content diversity score
  const contentTypes = new Set(platformMetrics.map(m => m.postId));
  const diversityScore = Math.min(100, (contentTypes.size / Math.max(platformMetrics.length, 1)) * 100);

  // Detect issues
  const issues: AlgorithmIssue[] = [];
  
  // Check for engagement drop
  if (platformMetrics.length >= 3) {
    const recent = platformMetrics.slice(-3);
    const older = platformMetrics.slice(-6, -3);
    if (older.length > 0) {
      const recentAvg = recent.reduce((sum, m) => sum + m.engagementRate, 0) / recent.length;
      const olderAvg = older.reduce((sum, m) => sum + m.engagementRate, 0) / older.length;
      if (recentAvg < olderAvg * 0.7) {
        issues.push({
          type: 'engagement_drop',
          severity: 'warning',
          message: 'Engagement rate has dropped significantly compared to recent posts',
          detectedAt: new Date(),
        });
      }
    }
  }

  // Check for posting frequency issues
  if (platformHistory.length > 0) {
    const lastPost = platformHistory[platformHistory.length - 1];
    const hoursSinceLastPost = (Date.now() - lastPost.publishedAt.getTime()) / (1000 * 60 * 60);
    
    const expectedIntervals: Record<SocialPlatform, number> = {
      tiktok: 24,
      facebook: 12,
      instagram: 24,
      youtube: 72,
    };
    
    if (hoursSinceLastPost > expectedIntervals[platform] * 2) {
      issues.push({
        type: 'inconsistent_posting',
        severity: 'info',
        message: `No posts on ${platform} for ${Math.floor(hoursSinceLastPost)} hours`,
        detectedAt: new Date(),
      });
    }
  }

  // Calculate shadowban risk
  let shadowbanRisk: 'low' | 'medium' | 'high' = 'low';
  const criticalIssues = issues.filter((i) => i.severity === 'critical' || i.severity === 'warning');
  
  // Look for signs of potential shadowban
  if (platformMetrics.length >= 5) {
    const recentViews = platformMetrics.slice(-5).map(m => m.views);
    const viewsTrend = recentViews[recentViews.length - 1] - recentViews[0];
    const avgViews = recentViews.reduce((a, b) => a + b, 0) / recentViews.length;
    
    if (viewsTrend < -avgViews * 0.5 && platformMetrics.every(m => m.views < avgViews * 0.3)) {
      shadowbanRisk = 'high';
      issues.push({
        type: 'potential_shadowban',
        severity: 'critical',
        message: 'Possible shadowban detected: views significantly below average',
        detectedAt: new Date(),
      });
    } else if (criticalIssues.length >= 2) {
      shadowbanRisk = 'medium';
    }
  }

  return {
    id: `${platform}-health-${Date.now()}`,
    organizationId: 'default-org',
    platform,
    shadowbanRisk,
    postingFrequencyScore,
    engagementScore,
    contentDiversityScore: diversityScore,
    issues,
    updatedAt: new Date(),
  };
}