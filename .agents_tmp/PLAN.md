# Plan: Content Creation Command Center

## 1. OBJECTIVE
Build the ultimate content creation and scheduling platform that surpasses Buffer in every way, fully optimized for top-performing content creators on YouTube, TikTok, Instagram, and Facebook. This system covers the complete content lifecycle from idea to analytics with platform-native features, algorithm optimization, and production workflow management.

**Architecture Note**: Design the system to support multi-tenancy from the start, enabling a future "Version 2" that can serve multiple users with their own accounts, billing, and isolated data.

## 1b. BUFFER COMPARISON - FEATURES WE'LL HAVE THAT BUFFER HAS
- ✅ Multi-platform posting (YouTube, TikTube, Instagram, Facebook)
- ✅ Visual content calendar
- ✅ Post scheduling with optimal time suggestions
- ✅ Media library
- ✅ Analytics dashboard
- ✅ Content queue management
- ✅ Post preview before publishing
- ✅ Hashtag suggestions
- ✅ Team collaboration features (ready for v2)
- ✅ Mobile-responsive design
- ✅ Post performance tracking
- ✅ Repost/evergreen content
- ✅ Content templates

## 1c. BUFFER COMPARISON - FEATURES WE'LL HAVE THAT BUFFER DOESN'T
- 🚫 Production pipeline workflow (idea → filming → editing → publish)
- 🚫 Series/playlist management
- 🚫 YouTube-specific: custom thumbnails, chapters, cards, end screens
- 🚫 YouTube SEO optimization tools
- 🚫 TikTok-specific: duet/stitch settings, cover frame selection
- 🚫 Instagram-specific: carousel builder, story stickers (via native), shopping tags
- 🚫 Facebook-specific: events, polls, offers, groups
- 🚫 AI-powered clip suggestions from long-form videos
- 🚫 Short-form clip editor with timeline
- 🚫 Production calendar (separate from publishing)
- 🚫 Filming schedule management
- 🚫 Milestone/deadline tracking with checklists
- 🚫 Algorithm health monitoring & shadowban detection
- 🚫 Platform-specific optimal posting times based on YOUR data
- 🚫 Content variety suggestions
- 🚫 Multi-tenant architecture (v2 ready)
- 🚫 Full SEO suite including keyword tracking
- 🚫 Comprehensive cross-platform analytics
- 🚫 Engagement-boosting CTA suggestions
- 🚫 Template performance analytics
- 🚫 Content pattern visualization (3 short/day, 3 long/week tracking)

## 2. CONTEXT SUMMARY
- **Creator Profile**: Top-performing YouTuber who schedules all content beforehand
- **Content Output**: 3 short-form posts/day + 3 long-form posts/week (18+ posts weekly)
- **Styling Reference**: Portfolio repo with Tailwind CSS v4, custom CSS variables (accent: #0d9488), dark mode
- **Tech Stack**: Next.js, TypeScript, Tailwind v4, Zustand, Lucide icons
- **Social Platforms**: TikTok, Facebook, Instagram, YouTube
- **Multi-Tenant**: Single-user v1 with v2 multi-user architecture ready

## 3. APPROACH OVERVIEW
Build a Next.js application with a multi-tenant-ready architecture:

1. **Styling Layer**: Match the Portfolio design system exactly (colors, fonts, components)
2. **Multi-Tenant Data Layer**: User/organization scoping on all data models (even if v1 only has one user)
3. **Platform Integration**: Connect each social media platform via OAuth/API
4. **Scheduling Engine**: Queue-based posting with platform awareness (no hard limits, respects cooldown periods)
5. **Dashboard UI**: Calendar view, post composer, queue management, analytics

**Why this approach**: 
- Starting with multi-tenant architecture avoids costly rewrites later
- Use user_id/organization_id scoping on all database tables from day one
- Externalize configuration (rate limits, cooldowns) to database/config so they can be adjusted per-user or globally

## 4. IMPLEMENTATION STEPS

### Phase 1: Styling Foundation (Match Portfolio)
- **1.1** Update `globals.css` with exact Portfolio design tokens
  - Accent color: #0d9488 (teal)
  - Background colors, text colors, shadows, borders
  - Dark mode variables
  - Typography with Inter, Lora, JetBrains Mono fonts
  - Animation keyframes (fadeIn, slideUp, etc.)

- **1.2** Ensure Font Loading
  - `src/lib/fonts.ts` already configured with correct fonts

- **1.3** Create Social Platform Color Variables
  - TikTok: #000000 (pink/teal gradient)
  - Facebook: #1877F2
  - Instagram: #E4405F (gradient)
  - YouTube: #FF0000

### Phase 2: Data Model & Storage (Multi-Tenant Ready)
- **2.1** Define TypeScript types for:
  // === CORE MULTI-TENANT ===
  - `User` (id, email, organization_id, role, created_at)
  - `Organization` (id, name, plan, settings)
  
  // === CONTENT PIPELINE ===
  - `ContentProject` (id, organization_id, user_id, title, description, status, production_stage, series_id, created_at)
    - Status: idea | scripting | filming | editing | review | ready | published
    - production_stage: tracks current workflow stage with timestamps
  - `Series` (id, organization_id, name, description, thumbnail_url, color)
  
  // === VIDEO-SPECIFIC (YouTube) ===
  - `YouTubeVideo` (id, content_project_id, title, description, tags[], thumbnail_url, privacy_status, category_id, publish_at, made_for_kids, recording_date, location, language, license, embedable)
  - `YouTubeChapter` (id, youtube_video_id, title, timestamp_seconds)
  - `YouTubeCard` (id, youtube_video_id, type, video_id, start_time, end_time, title, custom_image_url, annotation_image_url)
  - `YouTubeEndScreen` (id, youtube_video_id, elements[])
  
  // === SHORT-FORM PIPELINE ===
  - `ShortFormContent` (id, content_project_id, source_video_id, clip_start, clip_end, caption_text, vertical_crop)
  - `ShortFormPlatform` (id, short_form_id, platform, scheduled_at, status, platform_video_id)
  
  // === SOCIAL POST ===
  - `Post` (id, user_id, organization_id, content, media_urls, platforms[], scheduled_at, status, published_at, error_message, content_type, post_type, created_at)
  - post_type: social_post | video_publish | shorts_publish | community_post
  
  // === TEMPLATES ===
  - `ContentTemplate` (id, organization_id, name, category, body_template, media_defaults, platform_variations)
  - `DescriptionTemplate` (id, organization_id, name, template, tags_suggestions[])
  - `TitleTemplate` (id, organization_id, name, template_pattern)
  
  // === MEDIA ===
  - `MediaAsset` (id, organization_id, local_path, cloudinary_url, type, mime_type, duration_seconds, width, height, thumbnail_url, metadata, processing_status)
  - `MediaVariant` (id, media_asset_id, platform, resolution, file_path, cloudinary_public_id)
  
  // === PRODUCTION CALENDAR ===
  - `ProductionMilestone` (id, content_project_id, title, due_date, completed_at, notes)
  - `FilmingSchedule` (id, organization_id, date, location, content_project_ids[], notes)
  
  // === PLATFORM ===
  - `PlatformConnection` (user_id, platform, access_token, refresh_token, expires_at, platform_specific_ids)
  - `PostingHistory` (analytics data for cooldown/performance)
  - `CooldownSettings` (configurable per org)
  - `UserTimezonePreference`
  
  // === SEO & ANALYTICS ===
  - `KeywordTracker` (id, organization_id, keyword, target_videos[], search_volume, rank, updated_at)
  - `PerformanceMetrics` (id, post_id, platform, views, likes, comments, shares, engagement_rate, collected_at)
  - `AlgorithmHealth` (id, organization_id, platform, shadowban_risk, posting_frequency_score, engagement_score, updated_at)

- **2.2** Implement Database Layer
  - Add PostgreSQL via Prisma ORM (better for multi-tenant than SQLite)
  - All tables include `organization_id` column for tenant isolation
  - Index on (organization_id, scheduled_time) for efficient queries

- **2.3** Database Tables:
  ```
  // Core Multi-Tenant
  organizations (id, name, plan_type, settings_json, default_timezone, created_at)
  users (id, organization_id, email, role, avatar_url, created_at)
  
  // Content Pipeline
  content_projects (id, organization_id, user_id, series_id, title, description, status, thumbnail_url, idea_date, script_deadline, film_deadline, edit_deadline, publish_target_date, completed_at, notes, created_at)
  series (id, organization_id, name, description, thumbnail_url, color, created_at)
  
  // YouTube Video Details
  youtube_videos (id, content_project_id, title, description, tags_json, thumbnail_url, privacy_status, category_id, publish_at, made_for_kids, recording_date, location, language, license, embedable, created_at)
  youtube_chapters (id, youtube_video_id, title, timestamp_seconds, created_at)
  youtube_cards (id, youtube_video_id, type, linked_video_id, start_time, end_time, custom_title, custom_image_url, created_at)
  youtube_end_screens (id, youtube_video_id, elements_json, created_at)
  
  // Short-Form Content
  short_form_clips (id, content_project_id, source_media_id, clip_start_seconds, clip_end_seconds, caption_text, vertical_crop_data, status, created_at)
  short_form_schedules (id, short_form_clip_id, platform, scheduled_at, published_at, platform_video_id, status, error_message)
  
  // Social Posts
  posts (id, user_id, organization_id, content, media_urls_json, platforms[], scheduled_at, status, published_at, error_message, content_type, post_type, created_at)
  
  // Templates
  content_templates (id, organization_id, name, category, body_template, media_defaults_json, platform_variations_json, is_evergreen, repost_interval_days, created_at)
  description_templates (id, organization_id, name, template, tags_suggestions_json, created_at)
  title_templates (id, organization_id, name, template_pattern, created_at)
  
  // Media Assets
  media_assets (id, organization_id, original_filename, local_path, cloudinary_url, cloudinary_public_id, type, mime_type, duration_seconds, width, height, thumbnail_url, processing_status, metadata_json, created_at)
  media_variants (id, media_asset_id, platform, resolution, file_path, cloudinary_public_id, created_at)
  
  // Production Calendar
  production_milestones (id, content_project_id, title, due_date, completed_at, notes, created_at)
  filming_schedules (id, organization_id, date, location, notes, created_at)
  filming_schedule_projects (id, filming_schedule_id, content_project_id)
  
  // Platform Connections & History
  platform_connections (id, user_id, organization_id, platform, access_token_encrypted, refresh_token_encrypted, expires_at, platform_user_id, platform_username, created_at)
  posting_history (id, organization_id, post_id, platform, published_at, platform_post_id, views, likes, comments, shares)
  cooldown_settings (id, organization_id, platform, min_interval_minutes, is_active)
  user_timezone_preferences (id, organization_id, timezone, created_at)
  
  // SEO & Analytics
  keyword_trackers (id, organization_id, keyword, target_video_ids_json, search_volume, current_rank, updated_at)
  performance_metrics (id, organization_id, post_id, platform, views, likes, comments, shares, engagement_rate, collected_at)
  algorithm_health_checks (id, organization_id, platform, shadowban_risk_score, frequency_score, engagement_score, last_checked_at)
  ```

### Phase 3: Platform OAuth Connections
- **3.1** Create OAuth abstraction layer
  - Generic OAuth2 flow handler
  - Platform-specific adapters (TikTok, Facebook, Instagram, YouTube)
  - Token encryption at rest
  - Token refresh logic per platform

- **3.2** Platform-Specific OAuth & Capabilities (API-verified):

  **YouTube (YouTube Data API v3):**
  - Video upload (resumable uploads for large files, quota management)
  - Custom thumbnail upload (1280x720, verified account required)
  - Video metadata: title (100 chars), description (5000 chars), tags (500 chars)
  - Privacy status: public | unlisted | private | scheduled (via publishAt)
  - Category selection, language, recording date, location
  - License: Standard | Creative Commons | Public Domain
  - Made for Kids toggle (affects comment policies)
  - Embeddable, public stats visibility
  - Chapters (via description parsing, no dedicated API)
  - Playlists management (create, add videos)
  - Subscriptions (follow/unfollow channels)
  - YouTube Analytics API (views, watch time, CTR, retention, demographics)
  - YouTube Reporting API (bulk CSV exports, ad revenue)
  - Premiere scheduling (via publishAt + private + countdown)
  - **NOT SUPPORTED**: End screens/cards editing via public API (partner-only), Community posts API, Annotations (deprecated 2019)
  - **IMPORTANT**: Default quota 10,000 units/day, videos.insert ~1600 units
  
  **TikTok (Content Posting API v2):**
  - Video upload (FILE_UPLOAD or PULL_FROM_URL methods)
  - Photo posting (album posts)
  - Caption with hashtags/mentions (max 2200 UTF-16 chars)
  - Privacy settings: PUBLIC_TO_EVERYONE | MUTUAL_FOLLOW_FRIENDS | FOLLOWER_OF_CREATOR | SELF_ONLY
  - Content settings: disable_duet, disable_stitch, disable_comment
  - Cover frame selection (video_cover_timestamp_ms)
  - Branded content toggles (brand_content_toggle, brand_organic_toggle)
  - AIGC content labeling (is_aigc)
  - Post status checking via publish_id
  - Rate limits: 6 requests/min for upload init, 600 requests/min for user/video query
  - **NOT SUPPORTED**: Native sounds/music library, custom thumbnail upload, duet/stitch creation via API, effects/filters, post-publish editing
  - **NOTE**: Commercial Music Library via song_clip_id (partner feature)
  - App review required, may take days to weeks
  
  **Instagram (Graph API - Business accounts only):**
  - Photo posts (JPEG only, 320-1440px width, 4:5 to 1.91:1 aspect, 8MB max)
  - Video/Reels posts (MP4/MOV, H.264, AAC 48kHz, up to 15 min via API)
  - Carousel posts (up to 10 children, photo or video)
  - Reels with thumbnail selection (cover_url or thumb_offset)
  - Caption (2200 chars, 30 hashtags, 20 mentions)
  - Alt text for images (not for Reels/Stories)
  - Location tagging (Facebook Places ID)
  - User tagging (product tagging requires commerce setup)
  - Comment management (read, reply, hide, delete)
  - Stories publishing (Business only, no sticker support)
  - Media insights (impressions, reach, engagement, saves, views)
  - Account insights (follower growth, demographics)
  - Resumable uploads for large videos (rupload.facebook.com)
  - Container-based publishing (containers expire in 24 hours)
  - **NOT SUPPORTED**: Programmatic story stickers, shopping/promotional publishing, broadcast messaging, native scheduling (partner-only)
  - **IMPORTANT**: Requires Facebook Page connection, app review, business verification
  
  **Facebook (Graph API):**
  - Post types: text, photo, video, link, event, poll, offer
  - Video upload (up to 4GB, 240 min)
  - Scheduled publishing (via scheduled_publish_time + immediate_publish=false)
  - Multiple Page support
  - Group posting (with appropriate permissions)
  - Rich link previews customization
  - CTA buttons
  - Location tagging
  - Audience selector (public, friends, specific)
  - Poll creation with options
  - Event creation (title, description, start/end time, location, cover)
  - Live video scheduling
  - Comment management
  - Page insights (reach, engagements, page likes, video views)
  - Messenger integration (future enhancement)
  - **Rate limits**: ~200 requests/hour per user, write limits exist
  - **IMPORTANT**: Page Publishing Authorization (PPA) can block publishing

- **3.3** Future-Proof Design:
  - Easy to add new platforms (Pinterest, LinkedIn, X/Twitter)
  - Platform adapter interface for consistency

### Phase 4: Content Creation & Post Composer

- **4.1** Unified Content Hub
  - List all content: videos, shorts, social posts in one view
  - Filter by status, platform, content type, series
  - Quick actions: edit, schedule, duplicate, archive
  - Drag-and-drop reordering for bulk scheduling
  - Bulk select for batch operations (delete, reschedule, move)

- **4.2** Platform-Specific Post Composer
  
  **Universal Fields:**
  - Platform selector (multi-select)
  - Content text with character counter per platform
  - Media attachments (images, videos, GIFs)
  - Preview pane showing how it will look on each platform
  - Hashtag suggestions (based on content analysis)
  - @mention suggestions
  - Schedule datetime picker
  - Content type: short-form vs long-form
  
  **YouTube Composer:**
  - Video file upload with resumable uploads
  - Custom thumbnail upload with A/B testing option
  - Title (up to 100 chars) with AI suggestions
  - Description with rich template support
  - Tags (comma-separated, up to 500 chars)
  - Privacy: Public | Unlisted | Private | Scheduled
  - Category selection
  - License: Standard | Creative Commons | Public Domain
  - Made for Kids toggle (affects comment policies)
  - Recording date & location
  - Language
  - Chapters with auto-detect or manual add
  - Cards editor (link to other videos/playlists)
  - End screen builder
  - Auto chapters generation
  - Caption upload (SRT/VTT)
  - Loop video option
  - Premiere setup (with countdown)
  
  **TikTok Composer:**
  - Video file upload
  - Caption with trending hashtag suggestions
  - Music/sound selection from TikTok library
  - Duet/Stitch settings (on/off)
  - Visibility: Public | Private | Friends
  - Comment settings: All | Friends | Off
  - Download permission: Allow | Don't allow
  - Content disclosure toggle (sponsored content)
  - Cover frame selection
  - Caption language detection
  
  **Instagram Composer:**
  - Post Type selector: Feed | Reel | Story | Carousel
  - Feed: Single image or carousel (up to 10)
  - Reel: Video with music, effects, text overlays
  - Story: Photo/video with stickers, polls, questions, countdowns
  - Caption with hashtag suggestions
  - Location tag with search
  - User/product tags (for shopping)
  - Alt text editor
  - Hide likes/view count toggle
  - Close friends only (stories)
  - Schedule for Stories (auto-delete after 24h reminder)
  - Music library access
  
  **Facebook Composer:**
  - Post Type: Text | Photo | Video | Link | Event | Poll | Offer
  - Multiple page selector
  - Group selector (with permission checks)
  - Rich link preview customization
  - CTA button selection
  - Location tag
  - Tag people/pages
  - Audience selector (public, friends, specific)
  - Hide from timeline option
  - Disable comments option
  - Event details (if event type)
  - Poll options (if poll type)
  - Offer details (if offer type)

- **4.3** Short-Form Clip Creator
  - Import full YouTube video
  - Timeline editor with frame-accurate clipping
  - Preview clip
  - Auto-caption generation (for shorts)
  - Vertical crop selection (auto-detect best)
  - Text overlay editor
  - Platform-specific optimization warnings
  - Bulk clip from video (create multiple shorts from one video)
  - AI clip suggestions (highlights)

- **4.4** Content Templates System
  - Create reusable templates per platform
  - Title templates with variable substitution
  - Description templates with sections, links, timestamps
  - Hashtag bundles
  - Caption templates
  - Template categories: daily update, weekly roundup, promotional, engagement, educational
  - "Clone from template" for quick creation
  - Evergreen content with auto-repost
  - Template performance tracking

### Phase 5: Media Storage & Processing
- **5.1** Local Storage Layer
  - Upload media to `public/uploads/` or `data/media/`
  - File organization: `/media/{year}/{month}/{uuid}-{original-name}`
  - Supported formats: MP4, MOV, WebM (video), JPG, PNG, WebP, GIF (images)
  - Max file size: 500MB for videos, 20MB for images

- **5.2** Platform-Specific Media Processing
  
  **Video Specifications per Platform:**
  ```
  YouTube:
    - Resolution: 3840x2160 (4K), 1920x1080 (1080p), 1280x720 (720p)
    - Codec: H.264 or H.265 (HEVC)
    - Container: MP4
    - Audio: AAC stereo 48kHz
    - Max: 256GB file, 12 hours
    - Thumbnails: 1280x720 (JPG/PNG)
  
  YouTube Shorts:
    - Resolution: 1080x1920 (9:16)
    - Duration: up to 60 seconds
    - Same codec as regular YouTube
  
  TikTok:
    - Resolution: 1080x1920 (9:16)
    - Duration: up to 10 minutes (or 3 min for some accounts)
    - Codec: H.264
    - File size: up to 287MB (or 10GB for some)
    - Thumbnails: auto-generated, can select frame
  
  Instagram Reels:
    - Resolution: 1080x1920 (9:16)
    - Duration: up to 90 seconds (or 10 min with扩展)
    - Codec: H.264
    - Thumbnails: select from video frames
  
  Instagram Feed:
    - Square: 1080x1080
    - Portrait: 1080x1350
    - Landscape: 1080x566
    - Carousel: same aspect ratios
    - Formats: JPG, PNG, GIF
  
  Instagram Stories:
    - Resolution: 1080x1920 (9:16)
    - Duration: up to 60 sec per segment
    - Auto-advances to next
  
  Facebook Feed:
    - Video: 1280x720 recommended, up to 4GB, 240 min
    - Images: 1200x630 for link previews, 1080x1080 max
  
  Facebook Reels:
    - Similar to Instagram Reels specs
  ```
  
  **Cloudinary Integration:**
  - Auto-transcode to platform-specific resolutions
  - Watermark removal option
  - Quality optimization (file size vs quality)
  - Thumbnail generation at keyframes
  - Preview generation
  - CDN delivery for fast uploads to platforms

- **5.3** Media Library Component
  - Grid/list toggle view
  - Filter by: type, date, platform usage, series, processing status
  - Search by filename, tags
  - Preview with playback for videos
  - Video scrubbing for frame selection
  - Metadata editing (title, description, tags)
  - Usage tracking (which posts/projects use this media)
  - Duplicate detection (visual similarity)
  - Star/favorite media
  - Folder organization
  - Storage usage indicator
  - Bulk upload with drag-and-drop
  - Progress bar for large uploads

- **5.4** Media Processing Queue
  - Background processing for video transcoding
  - Queue jobs: thumbnail generation, platform-specific variants, format conversion
  - Progress tracking in UI
  - Retry failed processing jobs

### Phase 6: Timezone Handling
- **6.1** User Timezone Configuration
  - Detect user timezone automatically (browser API)
  - Allow manual timezone selection in settings
  - Store timezone preference per organization
  - Display all times in user's local timezone by default

- **6.2** Platform-Aware Scheduling Display
  - Show "optimal" times based on platform's primary audience timezone
  - Indicate when scheduling across timezones
  - Warning if scheduling at unusual hours for the platform
  - Option to view calendar in platform's "home" timezone

- **6.3** DST Handling
  - Use IANA timezone database (via date-fns-tz or similar)
  - Automatically adjust schedules when DST changes
  - Notify user of upcoming schedule shifts due to DST

### Phase 7: Calendar & Queue Views
- **7.1** Create `CalendarView` component
  - Month/week/day views
  - Post markers on dates
  - Click to view/edit posts
  - Color-coded by content type (short-form vs long-form)
  - Post density visualization (heatmap overlay)

- **7.2** Create `QueueView` component
  - List of upcoming posts sorted by time
  - Drag to reorder
  - Bulk actions
  - Quick edit inline

### Phase 8: Scheduling Engine
- **8.1** Implement background job processor
  - Cron-based scheduler (use node-cron or similar)
  - Check for posts due to publish every minute
  - Process queue at scheduled times
  - Retry failed posts with exponential backoff (max 3 retries)

- **8.2** Implement Cooldown Awareness (No Hard Limits)
  - Track last post time per platform per organization
  - Display "cooldown" warnings in UI (e.g., "Recommended to wait 30 min since last TikTok post")
  - No hard blocks - user can override if needed
  - Configurable cooldown periods in settings (defaults based on platform best practices)
  - **Cooldown Defaults**:
    - TikTok: ~1 hour between posts
    - Facebook: ~30 min between posts
    - Instagram: ~1 hour between posts
    - YouTube: ~2 hours between uploads

- **8.3** Platform-Native Scheduling
  - Facebook/Instagram: Use native scheduling API when available
  - TikTok/YouTube: Publish at exact time via API
  - Fallback: Use our own queue if native scheduling unavailable

- **8.4** Content Pattern Awareness
  - Track short-form vs long-form posts
  - No limits, but help user visualize their pattern (3 short/day, 3 long/week)
  - Calendar view shows post density to help planning

- **8.5** Evergreen Content Auto-Repost
  - Check evergreen posts for repost interval
  - Create new scheduled post from template when interval passes
  - Track original vs repost instances

### Phase 9: Algorithm-Aware Scheduling & Best Practices

- **9.1** Platform Algorithm Intelligence
  - Track posting frequency impact on each platform
  - Monitor engagement patterns per posting time
  - Recommend optimal posting windows based on YOUR data
  - Alert on potential shadowban indicators:
    - Sudden drop in impressions despite normal posting
    - Content not appearing in hashtag feeds
    - Follower count frozen
  - Track "algorithm health" score per platform

- **9.2** Optimal Posting Time Suggestions
  - Use historical data to find YOUR best times
  - Platform-specific suggestions:
    - **YouTube**: Publish at exact time (algorithm rewards punctuality)
    - **TikTok**: 6-9am, 12-3pm, 7-11pm (in YOUR audience timezone)
    - **Instagram**: 11am-1pm, 7-9pm
    - **Facebook**: 1-4pm on weekdays
  - Day-of-week patterns
  - "First to post" advantage tracking (be first with trending topics)

- **9.3** Content Freshness & Variety
  - Warn if posting too frequently to same audience
  - Suggest content diversity (don't post 5 gaming videos in a row)
  - Recency scoring (avoid old news/topics)
  - Cross-platform content variation (repurpose, not duplicate)
  - "Hook variety" suggestions (different intro styles)

- **9.4** Engagement-Boosting Features
  - CTA reminders (ask questions, prompt shares)
  - Hashtag strategy optimizer
  - Best-performing hashtag tracking
  - Trending hashtag alerts
  - @mention timing suggestions
  - Comment prompt templates

- **9.5** Anti-Shadowban Protection
  - Gradual ramp-up for new content types
  - Rate increase warnings before hitting limits
  - Content diversity enforcement
  - Quiet period suggestions after violations
  - Recovery monitoring

### Phase 10: Production Pipeline & Workflow

- **10.1** Content Project Board
  - Kanban-style board: Ideas → Scripting → Filming → Editing → Review → Ready → Scheduled
  - Drag content through stages
  - Stage timestamps (when entered, time spent)
  - Notes per stage
  - File attachments per stage (scripts, footage links)
  - Due date per stage
  - Assignee (for future team support)

- **10.2** Series & Playlist Management
  - Create series with consistent branding
  - Auto-add videos to YouTube playlists
  - Series ordering and numbering
  - Series thumbnail templates
  - Upcoming episodes tracker
  - Series analytics (how series performs vs standalone)

- **10.3** Production Calendar
  - Separate from publishing calendar
  - Track filming dates
  - Editor workload view
  - Editing deadline tracking
  - "Working on it" status for content
  - Editing time estimation
  - Milestone reminders

- **10.4** Milestone & Deadlines
  - Per-video/project deadlines
  - Auto-notifications (in-app + optional email)
  - Overdue alerts
  - Deadline extensions with reason logging
  - Pre-publish checklist:
    - [ ] Thumbnail approved
    - [ ] Title finalized
    - [ ] Description complete
    - [ ] Chapters added
    - [ ] Tags optimized
    - [ ] Scheduled

### Phase 11: SEO & Discovery Optimization

- **11.1** Keyword Research Integration
  - Track target keywords per video
  - Search volume tracking
  - Rank position monitoring
  - Keyword suggestions based on content
  - Competitor keyword discovery (manual input)
  - "Keyword in title/description" reminders

- **11.2** YouTube SEO Tools
  - Tag optimizer (length, relevance, competition)
  - Title analyzer (power words, numbers, length)
  - Description template with sections:
    - Hook
    - Timestamps
    - Resources/links
    - Social links
    - SEO keywords
  - Thumbnail text analysis
  - Competitor thumbnail comparison

- **11.3** Tag Management
  - Tag bundles for video types
  - Quick-add common tags
  - Tag performance tracking
  - Duplicate tag warnings
  - Platform-specific tag limits tracking

### Phase 12: Analytics & Performance Dashboard

- **12.1** Unified Analytics View
  - All-platform performance in one dashboard
  - Customizable date ranges
  - Export to CSV/Excel
  - Scheduled email reports

- **12.2** Platform-Specific Metrics
  **YouTube:**
  - Views, watch time, subscribers
  - Click-through rate (CTR)
  - Average view duration
  - Audience retention graphs
  - Traffic sources
  - Demographic breakdown
  - Revenue (if applicable)
  
  **TikTok:**
  - Views, likes, comments, shares
  - Profile visits
  - Follower growth
  - For You tab analysis
  - Sound usage stats
  
  **Instagram:**
  - Reach, impressions, engagement rate
  - Saves, shares, comments
  - Follower growth
  - Story views, replies, taps
  - Reel plays and shares
  - Hashtag performance
  
  **Facebook:**
  - Reach, engagements
  - Page likes/follows
  - Post shares
  - Comment sentiment
  - Video views

- **12.3** Comparative Analytics
  - This week vs last week
  - Content type performance comparison
  - Best-performing content identification
  - Worst-performing content (learn from these)
  - Optimal posting time analysis

- **12.4** Content Performance Alerts
  - New video underperforming notification
  - Unexpected viral spike
  - Engagement rate drops
  - Algorithm health warnings

### Phase 7: Dashboard & Analytics
- **7.1** Create main dashboard
  - Platform connection status
  - Today's scheduled posts
  - Quick compose button
  - Performance summary

- **7.2** Add basic analytics
  - Posts published this week
  - Platform breakdown
  - Best posting times (future enhancement)

## 5. TESTING AND VALIDATION

- **UI Consistency**: Compare components visually with Portfolio site
- **OAuth Flow**: Test connecting each platform
- **Scheduling**: Verify posts publish at correct times
- **Cooldown Warnings**: Confirm warnings display correctly (but don't block)
- **Error Handling**: Test failed posts, token refresh, network errors
- **Multi-Tenant Ready**: API queries scoped by organization_id (even with single user)

## 6. FUTURE V2 CONSIDERATIONS

When building Version 2 for multiple users:

- **Authentication**: Add NextAuth.js or similar (currently just local session for v1)
- **Billing**: Stripe integration for subscription plans
- **User Management**: Admin dashboard to manage users/organizations
- **Rate Limits**: Add per-user limits based on plan tier
- **Email Notifications**: Notify users of post failures, weekly reports
- **Team Features**: Multiple users per organization with roles
- **Analytics**: Cross-user aggregated analytics (admin view)

## 7. SIMPLIFIED FOR V1 (Single User)

Since this is v1 for personal use, some items are simplified:
- **Database**: Use SQLite with Prisma (easier local setup) - same schema, just different adapter
- **Auth**: No login system - assume single user on local machine
- **Hosting**: Designed to run locally or on any Node.js server
- **Trigger**: Node-cron for scheduling (runs within the app)
