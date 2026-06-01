import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addDays, addHours, startOfDay, isAfter, isBefore } from 'date-fns';
import type { Post, PostStatus, SocialPlatform, PostType, ContentType, CalendarEvent, PostingHistory } from '@/types';
import { useOrganizationStore } from './organizationStore';

// ============================================
// Posts Store
// ============================================

interface PostsState {
  posts: Post[];
  postingHistory: PostingHistory[];
  isLoading: boolean;
  
  // Computed getters
  getScheduledPosts: () => Post[];
  getPublishedPosts: () => Post[];
  getDraftPosts: () => Post[];
  getPostsByPlatform: (platform: SocialPlatform) => Post[];
  getPostsByDateRange: (start: Date, end: Date) => Post[];
  getCalendarEvents: () => CalendarEvent[];
  getLastPostTime: (platform: SocialPlatform) => Date | null;
  
  // Actions
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>) => Post;
  updatePost: (id: string, updates: Partial<Post>) => void;
  deletePost: (id: string) => void;
  publishPost: (id: string) => void;
  cancelPost: (id: string) => void;
  getNextScheduledPost: () => Post | null;
  getQueueWithCooldowns: () => Array<Post & { cooldownRemaining: number }>;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const usePostsStore = create<PostsState>()(
  persist(
    (set, get) => ({
      posts: [],
      postingHistory: [],
      isLoading: false,

      getScheduledPosts: () =>
        get().posts.filter((p) => p.status === 'scheduled'),

      getPublishedPosts: () =>
        get().posts.filter((p) => p.status === 'published'),

      getDraftPosts: () =>
        get().posts.filter((p) => p.status === 'draft'),

      getPostsByPlatform: (platform) =>
        get().posts.filter((p) => p.platforms.includes(platform)),

      getPostsByDateRange: (start, end) =>
        get().posts.filter((p) => {
          const postDate = p.scheduledAt || p.createdAt;
          return isAfter(postDate, start) && isBefore(postDate, end);
        }),

      getCalendarEvents: () => {
        const { posts } = get();
        return posts.map((post) => ({
          id: post.id,
          title: post.content.slice(0, 50) + (post.content.length > 50 ? '...' : ''),
          date: post.scheduledAt || post.publishedAt || post.createdAt,
          type: 'post' as const,
          status: post.status,
          platforms: post.platforms,
          postId: post.id,
        }));
      },

      getLastPostTime: (platform) => {
        const history = get().postingHistory.filter((h) => h.platform === platform);
        if (history.length === 0) return null;
        const sorted = history.sort(
          (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
        );
        return sorted[0].publishedAt;
      },

      addPost: (postData) => {
        const now = new Date();
        const newPost: Post = {
          ...postData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ posts: [...state.posts, newPost] }));
        return newPost;
      },

      updatePost: (id, updates) =>
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
          ),
        })),

      deletePost: (id) =>
        set((state) => ({
          posts: state.posts.filter((p) => p.id !== id),
        })),

      publishPost: (id) => {
        const post = get().posts.find((p) => p.id === id);
        if (!post) return;

        // Record to posting history for cooldown tracking
        const historyEntries: PostingHistory[] = post.platforms.map((platform) => ({
          id: generateId(),
          organizationId: post.organizationId,
          platform,
          postId: post.id,
          publishedAt: new Date(),
          engagement: { views: 0, likes: 0, comments: 0, shares: 0 },
        }));

        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === id
              ? { ...p, status: 'published' as PostStatus, publishedAt: new Date(), updatedAt: new Date() }
              : p
          ),
          postingHistory: [...state.postingHistory, ...historyEntries],
        }));
      },

      cancelPost: (id) =>
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === id ? { ...p, status: 'cancelled' as PostStatus, updatedAt: new Date() } : p
          ),
        })),

      getNextScheduledPost: () => {
        const now = new Date();
        const scheduled = get()
          .posts.filter((p) => p.status === 'scheduled' && p.scheduledAt && isAfter(p.scheduledAt, now))
          .sort((a, b) => (a.scheduledAt?.getTime() || 0) - (b.scheduledAt?.getTime() || 0));
        return scheduled[0] || null;
      },

      getQueueWithCooldowns: () => {
        const orgStore = useOrganizationStore.getState();
        const cooldownSettings = orgStore.organization?.settings.cooldownSettings;
        if (!cooldownSettings) return [];

        const now = new Date();
        return get()
          .posts.filter((p) => p.status === 'scheduled' && p.scheduledAt)
          .map((post) => {
            let maxCooldown = 0;
            
            for (const platform of post.platforms) {
              const lastPost = get().getLastPostTime(platform);
              const cooldownMinutes = cooldownSettings[platform];
              
              if (lastPost) {
                const cooldownEnd = addHours(lastPost, cooldownMinutes / 60);
                const remaining = Math.max(0, cooldownEnd.getTime() - now.getTime());
                maxCooldown = Math.max(maxCooldown, remaining);
              }
            }
            
            return {
              ...post,
              cooldownRemaining: maxCooldown,
            };
          })
          .filter((p) => p.cooldownRemaining > 0)
          .sort((a, b) => a.cooldownRemaining - b.cooldownRemaining);
      },
    }),
    {
      name: 'posts-storage',
    }
  )
);

// ============================================
// Compose Store
// ============================================

interface ComposeState {
  content: string;
  mediaUrls: string[];
  platforms: SocialPlatform[];
  scheduledAt: Date | null;
  postType: PostType;
  contentType: ContentType;
  isEvergreen: boolean;
  evergreenIntervalDays: number;
  tags: string[];
  
  // Platform-specific metadata
  youtubeTitle: string;
  youtubeDescription: string;
  youtubeTags: string[];
  youtubePrivacyStatus: 'private' | 'unlisted' | 'public';
  
  // Actions
  setContent: (content: string) => void;
  addMediaUrl: (url: string) => void;
  removeMediaUrl: (url: string) => void;
  setPlatforms: (platforms: SocialPlatform[]) => void;
  setScheduledAt: (date: Date | null) => void;
  setPostType: (type: PostType) => void;
  setContentType: (type: ContentType) => void;
  setIsEvergreen: (isEvergreen: boolean) => void;
  setEvergreenIntervalDays: (days: number) => void;
  setTags: (tags: string[]) => void;
  setYouTubeMeta: (meta: { title?: string; description?: string; tags?: string[]; privacy?: 'private' | 'unlisted' | 'public' }) => void;
  reset: () => void;
  createPost: () => Post | null;
}

export const useComposeStore = create<ComposeState>((set, get) => ({
  content: '',
  mediaUrls: [],
  platforms: [],
  scheduledAt: null,
  postType: 'social_post',
  contentType: 'short_form',
  isEvergreen: false,
  evergreenIntervalDays: 7,
  tags: [],
  youtubeTitle: '',
  youtubeDescription: '',
  youtubeTags: [],
  youtubePrivacyStatus: 'public',

  setContent: (content) => set({ content }),
  
  addMediaUrl: (url) =>
    set((state) => ({ mediaUrls: [...state.mediaUrls, url] })),
  
  removeMediaUrl: (url) =>
    set((state) => ({ mediaUrls: state.mediaUrls.filter((u) => u !== url) })),
  
  setPlatforms: (platforms) => set({ platforms }),
  
  setScheduledAt: (scheduledAt) => set({ scheduledAt }),
  
  setPostType: (postType) => set({ postType }),
  
  setContentType: (contentType) => set({ contentType }),
  
  setIsEvergreen: (isEvergreen) => set({ isEvergreen }),
  
  setEvergreenIntervalDays: (evergreenIntervalDays) => set({ evergreenIntervalDays }),
  
  setTags: (tags) => set({ tags }),
  
  setYouTubeMeta: (meta) =>
    set((state) => ({
      youtubeTitle: meta.title ?? state.youtubeTitle,
      youtubeDescription: meta.description ?? state.youtubeDescription,
      youtubeTags: meta.tags ?? state.youtubeTags,
      youtubePrivacyStatus: meta.privacy ?? state.youtubePrivacyStatus,
    })),

  reset: () =>
    set({
      content: '',
      mediaUrls: [],
      platforms: [],
      scheduledAt: null,
      postType: 'social_post',
      contentType: 'short_form',
      isEvergreen: false,
      evergreenIntervalDays: 7,
      tags: [],
      youtubeTitle: '',
      youtubeDescription: '',
      youtubeTags: [],
      youtubePrivacyStatus: 'public',
    }),

  createPost: () => {
    const state = get();
    const orgStore = useOrganizationStore.getState();
    
    if (!state.platforms.length) return null;
    if (!state.content && !state.mediaUrls.length) return null;

    const postsStore = usePostsStore.getState();
    
    return postsStore.addPost({
      userId: orgStore.user?.id || 'default-user',
      organizationId: orgStore.organization?.id || 'default-org',
      content: state.content,
      mediaUrls: state.mediaUrls,
      platforms: state.platforms,
      scheduledAt: state.scheduledAt || undefined,
      status: state.scheduledAt ? 'scheduled' : 'draft',
      postType: state.postType,
      contentType: state.contentType,
      isEvergreen: state.isEvergreen,
      evergreenIntervalDays: state.isEvergreen ? state.evergreenIntervalDays : undefined,
    });
  },
}));