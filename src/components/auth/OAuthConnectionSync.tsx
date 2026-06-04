'use client';

import { useEffect } from 'react';
import { usePlatformStore } from '@/stores';

// Cookie names for each platform
const COOKIE_MAP: Record<string, { access: string; stats?: string }> = {
  tiktok: { access: 'tt_access_token' },
  youtube: { access: 'yt_access_token', stats: 'yt_stats' },
  facebook: { access: 'fb_access_token' },
  instagram: { access: 'ig_access_token' },
};

/**
 * Parse a cookie value by name
 */
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * This component syncs OAuth connections from cookies AND database to the store.
 * It runs automatically when the app loads.
 * Add this to your root layout to enable auto-sync on all pages.
 */
export function OAuthConnectionSync() {
  const addConnection = usePlatformStore((state) => state.addConnection);
  const updateStats = usePlatformStore((state) => state.updateStats);
  const connections = usePlatformStore((state) => state.connections);

  useEffect(() => {
    // Sync from database (if logged in, connections are stored there)
    const syncFromDatabase = async () => {
      try {
        const response = await fetch('/api/platforms/connections');
        if (!response.ok) return;
        
        const data = await response.json();
        if (!data.connections?.length) return;
        
        const currentPlatforms = connections.map(c => c.platform);
        
        data.connections.forEach((conn: any) => {
          if (currentPlatforms.includes(conn.platform)) return;
          
          addConnection({
            platform: conn.platform,
            accessToken: conn.accessToken,
            refreshToken: conn.refreshToken,
            platformUserId: conn.platformUserId,
            platformUsername: conn.displayName,
            platformProfileImage: conn.profileImage,
            organizationId: conn.organizationId,
          });
        });
      } catch (error) {
        // Silently fail - connections might just be in cookies
      }
    };

    // Sync from cookies (fallback for non-logged-in users)
    const syncFromCookies = () => {
      const timeout = setTimeout(() => {
        const currentPlatforms = connections.map(c => c.platform);
        
        for (const [platform, cookies] of Object.entries(COOKIE_MAP)) {
          if (currentPlatforms.includes(platform as any)) continue;
          
          const accessToken = getCookie(cookies.access);
          if (!accessToken) continue;
          
          // Parse stats cookie if exists
          let stats = { followers: 0, following: 0, posts: 0 };
          if (cookies.stats) {
            const statsCookie = getCookie(cookies.stats);
            if (statsCookie) {
              try {
                const parsed = JSON.parse(statsCookie);
                stats = {
                  followers: parsed.subscribers || 0,
                  following: 0,
                  posts: 0,
                };
              } catch (e) {
                // ignore parse errors
              }
            }
          }
          
          addConnection({
            platform: platform as any,
            accessToken,
            platformUserId: 'oauth_user',
            permissions: [],
          });
          updateStats(platform as any, {
            platform: platform as any,
            ...stats,
          });
        }
      }, 100);
      
      return () => clearTimeout(timeout);
    };

    // Try database first, then cookies
    syncFromDatabase().then(syncFromCookies);
  }, [addConnection, updateStats, connections]);

  return null;
}