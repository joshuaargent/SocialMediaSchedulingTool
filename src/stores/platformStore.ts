import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlatformConnection, SocialPlatform, PlatformStats } from '@/types';

// ============================================
// Platform Connections Store
// ============================================

interface PlatformConnectionsState {
  connections: PlatformConnection[];
  platformStats: Record<SocialPlatform, PlatformStats | null>;
  isLoading: boolean;
  isConnecting: boolean;
  
  // Getters
  getConnection: (platform: SocialPlatform) => PlatformConnection | null;
  getConnectedPlatforms: () => SocialPlatform[];
  isPlatformConnected: (platform: SocialPlatform) => boolean;
  
  // Actions
  addConnection: (connection: {
    platform: SocialPlatform;
    accessToken?: string;
    platformUserId?: string;
    refreshToken?: string;
    expiresAt?: Date;
    platformUsername?: string;
    platformProfileImage?: string;
    lastSyncAt?: Date;
    permissions?: string[];
    userId?: string;
    organizationId?: string;
  }) => void;
  updateConnection: (platform: SocialPlatform, updates: Partial<PlatformConnection>) => void;
  removeConnection: (platform: SocialPlatform) => void;
  refreshToken: (platform: SocialPlatform, accessToken: string, expiresAt?: Date) => void;
  updateStats: (platform: SocialPlatform, stats: PlatformStats) => void;
  setLoading: (loading: boolean) => void;
  setConnecting: (connecting: boolean) => void;
}

const defaultStats: Record<SocialPlatform, PlatformStats | null> = {
  tiktok: null,
  facebook: null,
  instagram: null,
  youtube: null,
};

export const usePlatformStore = create<PlatformConnectionsState>()(
  persist(
    (set, get) => ({
      connections: [],
      platformStats: defaultStats,
      isLoading: false,
      isConnecting: false,

      getConnection: (platform) =>
        get().connections.find((c) => c.platform === platform) || null,

      getConnectedPlatforms: () =>
        get().connections.map((c) => c.platform),

      isPlatformConnected: (platform) =>
        get().connections.some((c) => c.platform === platform),

      addConnection: (connectionData) => {
        const newConnection: PlatformConnection = {
          id: `${connectionData.platform}-${Date.now()}`,
          connectedAt: new Date(),
          userId: connectionData.userId || '',
          organizationId: connectionData.organizationId || '',
          platform: connectionData.platform,
          accessToken: connectionData.accessToken || '',
          platformUserId: connectionData.platformUserId || '',
          refreshToken: connectionData.refreshToken,
          expiresAt: connectionData.expiresAt,
          platformUsername: connectionData.platformUsername,
          platformProfileImage: connectionData.platformProfileImage,
          lastSyncAt: connectionData.lastSyncAt,
          permissions: connectionData.permissions || [],
        };
        set((state) => ({
          connections: [
            ...state.connections.filter((c) => c.platform !== connectionData.platform),
            newConnection,
          ],
          isConnecting: false,
        }));
      },

      updateConnection: (platform, updates) =>
        set((state) => ({
          connections: state.connections.map((c) =>
            c.platform === platform ? { ...c, ...updates } : c
          ),
        })),

      removeConnection: (platform) =>
        set((state) => ({
          connections: state.connections.filter((c) => c.platform !== platform),
          platformStats: {
            ...state.platformStats,
            [platform]: null,
          },
        })),

      refreshToken: (platform, accessToken, expiresAt) =>
        set((state) => ({
          connections: state.connections.map((c) =>
            c.platform === platform
              ? { ...c, accessToken, expiresAt, lastSyncAt: new Date() }
              : c
          ),
        })),

      updateStats: (platform, stats) =>
        set((state) => ({
          platformStats: {
            ...state.platformStats,
            [platform]: stats,
          },
        })),

      setLoading: (isLoading) => set({ isLoading }),
      setConnecting: (isConnecting) => set({ isConnecting }),
    }),
    {
      name: 'platform-connections-storage',
      partialize: (state) => ({
        connections: state.connections,
        platformStats: state.platformStats,
      }),
    }
  )
);

// ============================================
// OAuth Configuration
// ============================================

export interface OAuthConfig {
  platform: SocialPlatform;
  clientId: string;
  authorizationUrl: string;
  scopes: string[];
  icon: string;
  color: string;
  name: string;
}

export const platformOAuthConfigs: Record<SocialPlatform, OAuthConfig> = {
  tiktok: {
    platform: 'tiktok',
    clientId: process.env.NEXT_PUBLIC_TIKTOK_CLIENT_ID || process.env.TIKTOK_CLIENT_ID || '',
    authorizationUrl: 'https://www.tiktok.com/v2/auth/authorize/',
    scopes: ['user.info.basic', 'video.upload', 'video.publish'],
    icon: 'Tiktok',
    color: '#000000',
    name: 'TikTok',
  },
  facebook: {
    platform: 'facebook',
    clientId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || process.env.FACEBOOK_CLIENT_ID || '',
    authorizationUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    scopes: ['pages_manage_posts', 'pages_read_engagement', 'instagram_basic', 'instagram_manage_insights'],
    icon: 'Facebook',
    color: '#1877F2',
    name: 'Facebook',
  },
  instagram: {
    platform: 'instagram',
    clientId: process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID || process.env.INSTAGRAM_CLIENT_ID || '',
    authorizationUrl: 'https://api.instagram.com/oauth/authorize',
    scopes: ['user_profile', 'user_media'],
    icon: 'Instagram',
    color: '#E4405F',
    name: 'Instagram',
  },
  youtube: {
    platform: 'youtube',
    clientId: process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID || process.env.YOUTUBE_CLIENT_ID || '',
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube',
      'https://www.googleapis.com/auth/youtube.readonly',
    ],
    icon: 'Youtube',
    color: '#FF0000',
    name: 'YouTube',
  },
};

// ============================================
// Helper Functions
// ============================================

export function buildOAuthUrl(config: OAuthConfig, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    scope: config.scopes.join(' '),
    response_type: 'code',
  });
  return `${config.authorizationUrl}?${params.toString()}`;
}

export function getPlatformIcon(platform: SocialPlatform): string {
  const icons: Record<SocialPlatform, string> = {
    tiktok: 'Tiktok',
    facebook: 'Facebook',
    instagram: 'Instagram',
    youtube: 'Youtube',
  };
  return icons[platform];
}

export function getPlatformColor(platform: SocialPlatform): string {
  const colors: Record<SocialPlatform, string> = {
    tiktok: '#000000',
    facebook: '#1877F2',
    instagram: '#E4405F',
    youtube: '#FF0000',
  };
  return colors[platform];
}

export function getPlatformName(platform: SocialPlatform): string {
  const names: Record<SocialPlatform, string> = {
    tiktok: 'TikTok',
    facebook: 'Facebook',
    instagram: 'Instagram',
    youtube: 'YouTube',
  };
  return names[platform];
}