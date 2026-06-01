import { addHours, addMinutes, differenceInMinutes, isAfter, isBefore } from 'date-fns';
import type { SocialPlatform, Post, PostingHistory, CooldownSettings } from '@/types';

// ============================================
// Scheduling Engine
// ============================================

export interface SchedulingResult {
  success: boolean;
  scheduledPosts: Post[];
  failedPosts: Array<{ post: Post; reason: string }>;
  cooldownsRemaining: Record<SocialPlatform, number>;
}

export interface CooldownCheck {
  canPublish: boolean;
  remainingMinutes: number;
  reason?: string;
  recommendedWaitMinutes: number;
}

// Default cooldown periods in minutes
export const DEFAULT_COOLDOWNS: CooldownSettings = {
  tiktok: 60,
  facebook: 30,
  instagram: 60,
  youtube: 120,
};

// ============================================
// Cooldown Management
// ============================================

export function getCooldownRemaining(
  platform: SocialPlatform,
  lastPostTime: Date | null,
  cooldowns: CooldownSettings
): number {
  if (!lastPostTime) return 0;
  
  const cooldownMinutes = cooldowns[platform];
  const cooldownEnd = addMinutes(lastPostTime, cooldownMinutes);
  const now = new Date();
  
  if (isBefore(now, cooldownEnd)) {
    return differenceInMinutes(cooldownEnd, now);
  }
  
  return 0;
}

export function checkCooldown(
  platform: SocialPlatform,
  postingHistory: PostingHistory[],
  cooldowns: CooldownSettings
): CooldownCheck {
  const lastPost = postingHistory
    .filter((h) => h.platform === platform)
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())[0];

  const lastPostTime = lastPost?.publishedAt || null;
  const remainingMinutes = getCooldownRemaining(platform, lastPostTime, cooldowns);
  
  return {
    canPublish: remainingMinutes === 0,
    remainingMinutes,
    reason: remainingMinutes > 0 
      ? `Please wait ${remainingMinutes} minutes since last ${platform} post` 
      : undefined,
    recommendedWaitMinutes: cooldowns[platform],
  };
}

export function checkAllPlatformsCooldown(
  platforms: SocialPlatform[],
  postingHistory: PostingHistory[],
  cooldowns: CooldownSettings
): Record<SocialPlatform, CooldownCheck> {
  const results: Record<SocialPlatform, CooldownCheck> = {} as Record<SocialPlatform, CooldownCheck>;
  
  for (const platform of platforms) {
    results[platform] = checkCooldown(platform, postingHistory, cooldowns);
  }
  
  return results;
}

// ============================================
// Schedule Management
// ============================================

export function getScheduledPostsReadyToPublish(
  posts: Post[],
  postingHistory: PostingHistory[],
  cooldowns: CooldownSettings
): Post[] {
  const now = new Date();
  
  return posts
    .filter((post) => {
      // Must be scheduled
      if (post.status !== 'scheduled' || !post.scheduledAt) return false;
      
      // Must be past scheduled time
      const scheduledTime = new Date(post.scheduledAt);
      if (isAfter(scheduledTime, now)) return false;
      
      // Check cooldown for all platforms
      const cooldownChecks = checkAllPlatformsCooldown(post.platforms, postingHistory, cooldowns);
      return Object.values(cooldownChecks).every((check) => check.canPublish);
    })
    .sort((a, b) => {
      // Sort by scheduled time, oldest first
      return new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime();
    });
}

export function getPostsWithPendingCooldown(
  posts: Post[],
  postingHistory: PostingHistory[],
  cooldowns: CooldownSettings
): Array<Post & { cooldowns: Record<SocialPlatform, CooldownCheck> }> {
  const now = new Date();
  
  return posts
    .filter((post) => {
      if (post.status !== 'scheduled' || !post.scheduledAt) return false;
      
      const scheduledTime = new Date(post.scheduledAt);
      if (isAfter(scheduledTime, now)) return false;
      
      // At least one platform has cooldown remaining
      const cooldownChecks = checkAllPlatformsCooldown(post.platforms, postingHistory, cooldowns);
      return Object.values(cooldownChecks).some((check) => !check.canPublish);
    })
    .map((post) => ({
      ...post,
      cooldowns: checkAllPlatformsCooldown(post.platforms, postingHistory, cooldowns),
    }))
    .sort((a, b) => {
      // Sort by maximum cooldown remaining
      const maxCooldownA = Math.max(...Object.values(a.cooldowns).map((c) => c.remainingMinutes));
      const maxCooldownB = Math.max(...Object.values(b.cooldowns).map((c) => c.remainingMinutes));
      return maxCooldownA - maxCooldownB;
    });
}

// ============================================
// Queue Processing
// ============================================

export function processPostQueue(
  posts: Post[],
  postingHistory: PostingHistory[],
  cooldowns: CooldownSettings,
  maxPostsPerBatch = 10
): SchedulingResult {
  const readyToPublish = getScheduledPostsReadyToPublish(posts, postingHistory, cooldowns);
  const postsToProcess = readyToPublish.slice(0, maxPostsPerBatch);
  
  const scheduledPosts: Post[] = [];
  const failedPosts: Array<{ post: Post; reason: string }> = [];
  
  for (const post of postsToProcess) {
    try {
      // In a real implementation, this would actually publish to the platforms
      scheduledPosts.push(post);
    } catch (error) {
      failedPosts.push({
        post,
        reason: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
  
  // Calculate remaining cooldowns
  const cooldownsRemaining: Record<SocialPlatform, number> = {
    tiktok: 0,
    facebook: 0,
    instagram: 0,
    youtube: 0,
  };
  
  const now = new Date();
  for (const platform of ['tiktok', 'facebook', 'instagram', 'youtube'] as SocialPlatform[]) {
    const lastPost = postingHistory
      .filter((h) => h.platform === platform)
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())[0];
    
    if (lastPost) {
      const cooldownMinutes = cooldowns[platform];
      const cooldownEnd = addMinutes(lastPost.publishedAt, cooldownMinutes);
      if (isBefore(now, cooldownEnd)) {
        cooldownsRemaining[platform] = differenceInMinutes(cooldownEnd, now);
      }
    }
  }
  
  return {
    success: failedPosts.length === 0,
    scheduledPosts,
    failedPosts,
    cooldownsRemaining,
  };
}

// ============================================
// Optimal Time Suggestions
// ============================================

export interface OptimalTime {
  time: Date;
  score: number;
  dayOfWeek: number;
  hour: number;
}

export function getOptimalPostingTimes(
  platform: SocialPlatform,
  postingHistory: PostingHistory[],
  limit = 5
): OptimalTime[] {
  // Default optimal times by platform
  const defaultTimes: Record<SocialPlatform, { dayOfWeek: number; hour: number; score: number }[]> = {
    tiktok: [
      { dayOfWeek: 1, hour: 9, score: 0.9 },
      { dayOfWeek: 1, hour: 12, score: 0.85 },
      { dayOfWeek: 1, hour: 19, score: 0.95 },
      { dayOfWeek: 3, hour: 9, score: 0.88 },
      { dayOfWeek: 3, hour: 19, score: 0.92 },
      { dayOfWeek: 5, hour: 12, score: 0.87 },
      { dayOfWeek: 5, hour: 19, score: 0.94 },
      { dayOfWeek: 6, hour: 10, score: 0.91 },
      { dayOfWeek: 6, hour: 14, score: 0.89 },
      { dayOfWeek: 6, hour: 20, score: 0.96 },
      { dayOfWeek: 0, hour: 10, score: 0.88 },
      { dayOfWeek: 0, hour: 19, score: 0.93 },
    ],
    facebook: [
      { dayOfWeek: 1, hour: 14, score: 0.92 },
      { dayOfWeek: 2, hour: 15, score: 0.89 },
      { dayOfWeek: 3, hour: 14, score: 0.91 },
      { dayOfWeek: 4, hour: 15, score: 0.88 },
      { dayOfWeek: 5, hour: 13, score: 0.90 },
    ],
    instagram: [
      { dayOfWeek: 1, hour: 12, score: 0.91 },
      { dayOfWeek: 1, hour: 20, score: 0.94 },
      { dayOfWeek: 2, hour: 11, score: 0.88 },
      { dayOfWeek: 3, hour: 13, score: 0.90 },
      { dayOfWeek: 4, hour: 19, score: 0.93 },
      { dayOfWeek: 5, hour: 12, score: 0.92 },
      { dayOfWeek: 6, hour: 11, score: 0.89 },
      { dayOfWeek: 6, hour: 20, score: 0.95 },
      { dayOfWeek: 0, hour: 12, score: 0.90 },
    ],
    youtube: [
      { dayOfWeek: 3, hour: 16, score: 0.95 },
      { dayOfWeek: 4, hour: 16, score: 0.93 },
      { dayOfWeek: 5, hour: 16, score: 0.92 },
      { dayOfWeek: 6, hour: 14, score: 0.91 },
      { dayOfWeek: 6, hour: 16, score: 0.94 },
      { dayOfWeek: 0, hour: 14, score: 0.90 },
    ],
  };

  // Analyze historical performance to adjust scores
  const platformHistory = postingHistory.filter((h) => h.platform === platform);
  
  if (platformHistory.length < 5) {
    // Not enough data, return default times
    return defaultTimes[platform]
      .slice(0, limit)
      .map((t) => ({
        time: getNextOccurrence(t.dayOfWeek, t.hour),
        score: t.score,
        dayOfWeek: t.dayOfWeek,
        hour: t.hour,
      }));
  }

  // Calculate performance by day/hour
  const performanceBySlot: Record<string, { total: number; count: number }> = {};
  
  for (const history of platformHistory) {
    const date = new Date(history.publishedAt);
    const dayOfWeek = date.getDay();
    const hour = date.getHours();
    const key = `${dayOfWeek}-${hour}`;
    
    if (!performanceBySlot[key]) {
      performanceBySlot[key] = { total: 0, count: 0 };
    }
    
    const engagement = history.engagement.views + 
      history.engagement.likes * 2 + 
      history.engagement.comments * 3 +
      history.engagement.shares * 4;
    
    performanceBySlot[key].total += engagement;
    performanceBySlot[key].count += 1;
  }

  // Combine defaults with historical data
  const combinedTimes = defaultTimes[platform].map((t) => {
    const key = `${t.dayOfWeek}-${t.hour}`;
    const historical = performanceBySlot[key];
    
    if (historical) {
      const avgEngagement = historical.total / historical.count;
      // Normalize and blend scores
      const adjustedScore = t.score * 0.6 + Math.min(avgEngagement / 10000, 1) * 0.4;
      return { ...t, score: adjustedScore };
    }
    
    return t;
  });

  return combinedTimes
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((t) => ({
      time: getNextOccurrence(t.dayOfWeek, t.hour),
      score: t.score,
      dayOfWeek: t.dayOfWeek,
      hour: t.hour,
    }));
}

// ============================================
// Helper Functions
// ============================================

function getNextOccurrence(dayOfWeek: number, hour: number): Date {
  const now = new Date();
  const currentDay = now.getDay();
  const currentHour = now.getHours();
  
  let daysUntil = dayOfWeek - currentDay;
  if (daysUntil < 0) daysUntil += 7;
  if (daysUntil === 0 && currentHour >= hour) daysUntil += 7;
  
  const nextDate = new Date(now);
  nextDate.setDate(nextDate.getDate() + daysUntil);
  nextDate.setHours(hour, 0, 0, 0);
  
  return nextDate;
}

export function formatCooldownMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

// ============================================
// Scheduling Rules Engine
// ============================================

export interface SchedulingRule {
  id: string;
  name: string;
  check: (post: Post, cooldowns: CooldownSettings) => boolean;
  priority: 'required' | 'warning' | 'info';
  message: string;
}

export const defaultSchedulingRules: SchedulingRule[] = [
  {
    id: 'cooldown',
    name: 'Platform Cooldown',
    check: (post, cooldowns) => true, // Handled separately
    priority: 'required',
    message: 'Cooldown period must be respected',
  },
  {
    id: 'content_required',
    name: 'Content Required',
    check: (post) => post.content.length > 0 || post.mediaUrls.length > 0,
    priority: 'required',
    message: 'Post must have content or media',
  },
  {
    id: 'platform_required',
    name: 'Platform Required',
    check: (post) => post.platforms.length > 0,
    priority: 'required',
    message: 'Post must target at least one platform',
  },
  {
    id: 'future_time',
    name: 'Future Scheduling',
    check: (post) => {
      if (!post.scheduledAt) return true; // Drafts don't need future time
      return isAfter(new Date(post.scheduledAt), new Date());
    },
    priority: 'required',
    message: 'Scheduled time must be in the future',
  },
];

export function validatePostForScheduling(
  post: Post,
  cooldowns: CooldownSettings
): { valid: boolean; issues: Array<{ rule: SchedulingRule; passed: boolean }> } {
  const issues: Array<{ rule: SchedulingRule; passed: boolean }> = [];
  
  for (const rule of defaultSchedulingRules) {
    const passed = rule.check(post, cooldowns);
    issues.push({ rule, passed });
  }
  
  const valid = issues.every((issue) => issue.passed || issue.rule.priority !== 'required');
  
  return { valid, issues };
}