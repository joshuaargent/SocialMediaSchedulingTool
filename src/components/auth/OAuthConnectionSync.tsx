'use client';

import { useEffect } from 'react';
import { usePlatformStore } from '@/stores';
import type { SocialPlatform } from '@/types';

/**
 * This component syncs OAuth connections from database AND checks server-side cookies.
 * It runs automatically when the app loads.
 */
export function OAuthConnectionSync() {
  const addConnection = usePlatformStore((state) => state.addConnection);
  const connections = usePlatformStore((state) => state.connections);

  useEffect(() => {
    const syncConnections = async () => {
      const currentPlatforms = connections.map(c => c.platform) as SocialPlatform[];
      
      // 1. Check DB connections (if logged in, tokens stored there)
      try {
        const dbResponse = await fetch('/api/platforms/connections');
        if (dbResponse.ok) {
          const dbData = await dbResponse.json();
          if (dbData.connections?.length) {
            for (const conn of dbData.connections) {
              if (!currentPlatforms.includes(conn.platform as SocialPlatform)) {
                addConnection({
                  platform: conn.platform as SocialPlatform,
                  accessToken: conn.accessToken,
                  refreshToken: conn.refreshToken,
                  platformUserId: conn.platformUserId,
                  platformUsername: conn.displayName,
                  platformProfileImage: conn.profileImage,
                  organizationId: conn.organizationId,
                });
              }
            }
            return; // DB has connections, no need to check cookies
          }
        }
      } catch (error) {
        console.error('DB sync failed:', error);
      }
      
      // 2. Check httpOnly cookies via server (for non-logged-in users)
      try {
        const cookieResponse = await fetch('/api/platforms/check');
        if (cookieResponse.ok) {
          const { platforms } = await cookieResponse.json();
          for (const [platform, hasToken] of Object.entries(platforms)) {
            if (hasToken && !currentPlatforms.includes(platform as SocialPlatform)) {
              addConnection({
                platform: platform as SocialPlatform,
                accessToken: 'cookie_based',
                platformUserId: 'oauth_user',
                permissions: [],
              });
            }
          }
        }
      } catch (error) {
        console.error('Cookie sync failed:', error);
      }
    };

    syncConnections();
  }, [addConnection, connections]);

  return null;
}