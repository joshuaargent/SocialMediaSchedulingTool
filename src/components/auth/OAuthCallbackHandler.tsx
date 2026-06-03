'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { usePlatformStore } from '@/stores';
import type { SocialPlatform } from '@/types';

interface OAuthCallbackHandlerProps {
  platform: SocialPlatform;
}

// Cookie names for each platform
const COOKIE_MAP: Record<string, string> = {
  tiktok: 'tt_access_token',
  youtube: 'yt_access_token',
  facebook: 'fb_access_token',
  instagram: 'ig_access_token',
};

// Sync connections from cookies on mount
function useSyncConnectionsFromCookies() {
  const addConnection = usePlatformStore((state) => state.addConnection);
  const updateStats = usePlatformStore((state) => state.updateStats);
  const connections = usePlatformStore((state) => state.connections);

  useEffect(() => {
    // Small delay to ensure Zustand persist has loaded
    const timeout = setTimeout(() => {
      const currentPlatforms = connections.map(c => c.platform);
      
      for (const [platform, cookieName] of Object.entries(COOKIE_MAP)) {
        if (currentPlatforms.includes(platform as SocialPlatform)) continue;
        
        if (document.cookie.includes(`${cookieName}=`)) {
          addConnection({
            platform: platform as SocialPlatform,
            accessToken: 'connected_via_oauth',
            platformUserId: 'oauth_user',
          });
          updateStats(platform as SocialPlatform, {
            followers: 0,
            views: 0,
            engagement: 0,
          });
        }
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [addConnection, updateStats, connections]);
}

export function OAuthCallbackHandler({ platform }: OAuthCallbackHandlerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const addConnection = usePlatformStore((state) => state.addConnection);
  const updateStats = usePlatformStore((state) => state.updateStats);
  const connections = usePlatformStore((state) => state.connections);

  // Sync connections from cookies on mount
  useSyncConnectionsFromCookies();

  useEffect(() => {
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');
    
    if (error) {
      router.replace('/settings');
      return;
    }
    
    if (connected === platform) {
      if (!connections.some(c => c.platform === platform)) {
        addConnection({
          platform,
          accessToken: 'connected_via_oauth',
          platformUserId: 'oauth_user',
        });
        updateStats(platform, {
          followers: 0,
          views: 0,
          engagement: 0,
        });
      }
      router.replace('/settings');
    } else if (connected) {
      router.replace('/settings');
    }
  }, [searchParams, router, platform, addConnection, updateStats, connections]);

  return null;
}