'use client';

import { useEffect } from 'react';
import { usePlatformStore } from '@/stores';

// Cookie names for each platform
const COOKIE_MAP: Record<string, string> = {
  tiktok: 'tt_access_token',
  youtube: 'yt_access_token',
  facebook: 'fb_access_token',
  instagram: 'ig_access_token',
};

/**
 * This component syncs OAuth connections from cookies to the store.
 * It runs automatically when the app loads.
 * Add this to your root layout to enable auto-sync on all pages.
 */
export function OAuthConnectionSync() {
  const addConnection = usePlatformStore((state) => state.addConnection);
  const updateStats = usePlatformStore((state) => state.updateStats);
  const connections = usePlatformStore((state) => state.connections);

  useEffect(() => {
    // Small delay to ensure Zustand persist has loaded
    const timeout = setTimeout(() => {
      const currentPlatforms = connections.map(c => c.platform);
      
      for (const [platform, cookieName] of Object.entries(COOKIE_MAP)) {
        if (currentPlatforms.includes(platform as any)) continue;
        
        if (document.cookie.includes(`${cookieName}=`)) {
          addConnection({
            platform: platform as any,
            accessToken: 'connected_via_oauth',
            platformUserId: 'oauth_user',
            permissions: [],
          });
          updateStats(platform as any, {
            platform: platform as any,
            followers: 0,
            following: 0,
            posts: 0,
          });
        }
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [addConnection, updateStats, connections]);

  return null;
}