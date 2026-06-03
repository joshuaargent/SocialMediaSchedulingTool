// ============================================
// Core Types for Social Media Scheduling Tool
// ============================================

// ----- Site Configuration -----
export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  location?: string;
  links: {
    youtube: string;
    github: string;
    instagram: string;
    facebook: string;
    strava: string;
    email: string;
  };
  author: {
    name: string;
    bio: string;
    avatar?: string;
  };
}

// ----- Navigation -----
export interface NavItem {
  label: string;
  href: string;
}

// ----- Component Props -----
export interface BaseProps {
  className?: string;
  children?: React.ReactNode;
}

export interface SectionProps extends BaseProps {
  id?: string;
  title?: string;
}

// ----- Form Types -----
export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// ============================================
// MULTI-TENANT CORE TYPES
// ============================================

export interface Organization {
  id: string;
  name: string;
  planType: 'free' | 'pro' | 'business';
  settings: OrganizationSettings;
  defaultTimezone: string;
  createdAt: Date;
}

export interface OrganizationSettings {
  cooldownSettings: CooldownSettings;
  postingLimits: PostingLimits;
  defaultOptimalTimes: Record<SocialPlatform, string[]>;
}

export interface User {
  id: string;
  organizationId: string;
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  avatarUrl?: string;
  createdAt: Date;
}

// ============================================
// SOCIAL PLATFORMS
// ============================================

export type SocialPlatform = 'tiktok' | 'facebook' | 'instagram' | 'youtube';

export interface PlatformConnection {
  id: string;
  userId: string;
  organizationId: string;
  platform: SocialPlatform;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  platformUserId: string;
  platformUsername?: string;
  platformProfileImage?: string;
  connectedAt: Date;
  lastSyncAt?: Date;
  permissions: string[];
}

export interface PlatformStats {
  platform: SocialPlatform;
  followers: number;
  following: number;
  posts: number;
  totalViews?: number;
  totalPosts?: number;
  lastPostAt?: Date;
  lastUpdated?: Date;
}

// ============================================
// POST TYPES
// ============================================

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed' | 'cancelled';
export type PostType = 'social_post' | 'video_publish' | 'shorts_publish' | 'community_post';
export type ContentType = 'short_form' | 'long_form' | 'story' | 'reel' | 'live';

export interface Post {
  id: string;
  userId: string;
  organizationId: string;
  content: string;
  mediaUrls: string[];
  platforms: SocialPlatform[];
  scheduledAt?: Date;
  publishedAt?: Date;
  status: PostStatus;
  postType: PostType;
  contentType?: ContentType;
  errorMessage?: string;
  isEvergreen: boolean;
  evergreenIntervalDays?: number;
  lastRepostAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostPlatformTarget {
  id: string;
  postId: string;
  platform: SocialPlatform;
  platformPostId?: string;
  scheduledAt?: Date;
  publishedAt?: Date;
  status: PostStatus;
  errorMessage?: string;
  metadata?: PlatformSpecificMetadata;
}

export interface PlatformSpecificMetadata {
  // TikTok
  tiktokPrivacyLevel?: 'public' | 'friends' | 'private';
  tiktokCoverFrame?: number;
  tiktokDuetEnabled?: boolean;
  tiktokStitchEnabled?: boolean;
  
  // YouTube
  youtubeTitle?: string;
  youtubeDescription?: string;
  youtubeTags?: string[];
  youtubeThumbnailUrl?: string;
  youtubePrivacyStatus?: 'private' | 'unlisted' | 'public';
  youtubeCategoryId?: string;
  youtubeMadeForKids?: boolean;
  youtubeRecordingDate?: Date;
  youtubeLocation?: string;
  youtubeLanguage?: string;
  youtubeChapters?: YouTubeChapter[];
  youtubeCards?: YouTubeCard[];
  youtubeEndScreen?: YouTubeEndScreen;
  
  // Instagram
  instagramLocation?: string;
  instagramUserTags?: string[];
  instagramCarouselImages?: string[];
  
  // Facebook
  facebookPageId?: string;
  facebookTargeting?: {
    countries: string[];
    ageMin?: number;
    ageMax?: number;
    genders: number[];
  };
}

// ============================================
// YOUTUBE-SPECIFIC TYPES
// ============================================

export interface YouTubeChapter {
  id: string;
  youtubeVideoId: string;
  title: string;
  timestampSeconds: number;
}

export interface YouTubeCard {
  id: string;
  youtubeVideoId: string;
  type: 'video' | 'playlist' | 'channel' | 'link';
  videoId?: string;
  playlistId?: string;
  channelId?: string;
  linkUrl?: string;
  startTime: number;
  endTime: number;
  title: string;
  customImageUrl?: string;
  annotationImageUrl?: string;
}

export interface YouTubeEndScreenElement {
  type: 'video' | 'playlist' | 'subscribe';
  videoId?: string;
  playlistId?: string;
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface YouTubeEndScreen {
  id: string;
  youtubeVideoId: string;
  elements: YouTubeEndScreenElement[];
}

// ============================================
// SHORT-FORM CONTENT TYPES
// ============================================

export interface ShortFormContent {
  id: string;
  contentProjectId: string;
  sourceVideoId: string;
  clipStart: number;
  clipEnd: number;
  captionText: string;
  verticalCrop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  soundId?: string;
  createdAt: Date;
}

export interface ShortFormPlatform {
  id: string;
  shortFormId: string;
  platform: SocialPlatform;
  scheduledAt?: Date;
  publishedAt?: Date;
  status: PostStatus;
  platformVideoId?: string;
  errorMessage?: string;
}

// ============================================
// CONTENT PIPELINE TYPES
// ============================================

export type ProductionStage = 
  | 'idea' 
  | 'scripting' 
  | 'filming' 
  | 'editing' 
  | 'review' 
  | 'ready' 
  | 'published';

export type ProjectStatus = 
  | 'active' 
  | 'archived' 
  | 'on_hold' 
  | 'cancelled';

export interface ContentProject {
  id: string;
  organizationId: string;
  userId: string;
  seriesId?: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  productionStage: ProductionStage;
  thumbnailUrl?: string;
  ideaDate?: Date;
  scriptDeadline?: Date;
  filmingDate?: Date;
  editingDeadline?: Date;
  publishDate?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StageTimestamp {
  stage: ProductionStage;
  enteredAt: Date;
  durationMinutes?: number;
  notes?: string;
}

export interface Series {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  color: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// TEMPLATES
// ============================================

export type TemplateCategory = 
  | 'caption' 
  | 'description' 
  | 'hashtag' 
  | 'cta' 
  | 'hook' 
  | 'thumbnail';

export interface ContentTemplate {
  id: string;
  organizationId: string;
  name: string;
  category: TemplateCategory;
  bodyTemplate: string;
  mediaDefaults?: {
    aspectRatio?: string;
    format?: string;
  };
  platformVariations?: Partial<Record<SocialPlatform, string>>;
  usageCount: number;
  performanceScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DescriptionTemplate {
  id: string;
  organizationId: string;
  name: string;
  template: string;
  tagSuggestions: string[];
  sections?: {
    hook: string;
    body: string;
    links: string;
    social: string;
  };
  createdAt: Date;
}

export interface TitleTemplate {
  id: string;
  organizationId: string;
  name: string;
  templatePattern: string;
  exampleTitles: string[];
  createdAt: Date;
}

// ============================================
// MEDIA ASSETS
// ============================================

export type MediaType = 'image' | 'video' | 'audio' | 'document';
export type ProcessingStatus = 'pending' | 'processing' | 'ready' | 'failed';

export interface MediaAsset {
  id: string;
  organizationId: string;
  localPath?: string;
  cloudinaryUrl?: string;
  cloudinaryPublicId?: string;
  type: MediaType;
  mimeType: string;
  filename: string;
  fileSize: number;
  durationSeconds?: number;
  width?: number;
  height?: number;
  thumbnailUrl?: string;
  metadata: Record<string, unknown>;
  processingStatus: ProcessingStatus;
  createdAt: Date;
}

export interface MediaVariant {
  id: string;
  mediaAssetId: string;
  platform: SocialPlatform;
  resolution: string;
  filePath?: string;
  cloudinaryPublicId?: string;
  createdAt: Date;
}

// ============================================
// PRODUCTION CALENDAR
// ============================================

export interface ProductionMilestone {
  id: string;
  contentProjectId: string;
  title: string;
  dueDate: Date;
  completedAt?: Date;
  notes?: string;
  checklist: MilestoneChecklistItem[];
}

export interface MilestoneChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface FilmingSchedule {
  id: string;
  organizationId: string;
  date: Date;
  location?: string;
  contentProjectIds: string[];
  notes?: string;
  createdAt: Date;
}

// ============================================
// SCHEDULING & COOLDOWNS
// ============================================

export interface CooldownSettings {
  tiktok: number; // minutes
  facebook: number;
  instagram: number;
  youtube: number;
}

export interface PostingLimits {
  tiktok: number; // per day
  facebook: number;
  instagram: number;
  youtube: number;
}

export interface PostingHistory {
  id: string;
  organizationId: string;
  platform: SocialPlatform;
  postId: string;
  publishedAt: Date;
  engagement: EngagementMetrics;
  reach?: number;
}

export interface OptimalPostingTime {
  platform: SocialPlatform;
  dayOfWeek: number;
  hour: number;
  minute: number;
  score: number;
}

// ============================================
// ANALYTICS & PERFORMANCE
// ============================================

export interface EngagementMetrics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves?: number;
  clicks?: number;
  reach?: number;
  impressions?: number;
}

export interface PerformanceMetrics {
  id: string;
  postId: string;
  platform: SocialPlatform;
  platformPostId: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  collectedAt: Date;
}

export interface AnalyticsSummary {
  totalPosts: number;
  totalViews: number;
  totalEngagement: number;
  averageEngagementRate: number;
  topPerformingPost?: Post;
  worstPerformingPost?: Post;
  platformBreakdown: Record<SocialPlatform, PlatformAnalytics>;
}

export interface PlatformAnalytics {
  posts: number;
  views: number;
  engagement: number;
  engagementRate: number;
  topPostingTime?: string;
}

// ============================================
// ALGORITHM HEALTH
// ============================================

export interface AlgorithmHealth {
  id: string;
  organizationId: string;
  platform: SocialPlatform;
  shadowbanRisk: 'low' | 'medium' | 'high';
  postingFrequencyScore: number;
  engagementScore: number;
  contentDiversityScore: number;
  issues: AlgorithmIssue[];
  updatedAt: Date;
}

export interface AlgorithmIssue {
  type: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  detectedAt: Date;
}

// ============================================
// SEO & KEYWORDS
// ============================================

export interface KeywordTracker {
  id: string;
  organizationId: string;
  keyword: string;
  targetVideos: string[];
  searchVolume?: number;
  rank?: number;
  updatedAt: Date;
}

export interface HashtagSuggestion {
  tag: string;
  usageCount: number;
  trending: boolean;
  score: number;
}

export interface SEOScore {
  overall: number;
  title: number;
  description: number;
  tags: number;
  thumbnail: number;
  engagementPrediction: number;
  suggestions: SEOSuggestion[];
}

export interface SEOSuggestion {
  type: 'improvement' | 'warning' | 'tip';
  category: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
}

// ============================================
// UI STATE TYPES
// ============================================

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'post' | 'video' | 'filming' | 'milestone' | 'deadline';
  status?: PostStatus | ProductionStage;
  platforms?: SocialPlatform[];
  postId?: string;
  projectId?: string;
  thumbnail?: string;
  stats?: {
    views: number;
    likes: number;
    comments: number;
  };
}

export interface ComposeState {
  content: string;
  mediaUrls: string[];
  platforms: SocialPlatform[];
  scheduledAt?: Date;
  postType: PostType;
  contentType: ContentType;
  isEvergreen: boolean;
  tags: string[];
}

export interface QueueItem {
  id: string;
  post: Post;
  scheduledTime: Date;
  cooldownRemaining: number;
  canPublish: boolean;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType = 
  | 'post_published' 
  | 'post_failed' 
  | 'cooldown_warning' 
  | 'algorithm_alert'
  | 'milestone_due'
  | 'analytics_update';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}
