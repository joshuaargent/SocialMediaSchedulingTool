'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { usePlatformStore } from '@/stores';
import type { SocialPlatform } from '@/types';

interface OAuthCallbackHandlerProps {
  platform: SocialPlatform;
}

export function OAuthCallbackHandler({ platform }: OAuthCallbackHandlerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const addConnection = usePlatformStore((state) => state.addConnection);
  const updateStats = usePlatformStore((state) => state.updateStats);

  useEffect(() => {
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');
    
    if (error) {
      // Redirect back to settings without query params
      router.replace('/settings');
      return;
    }
    
    if (connected === platform) {
      // Fetch connection data from cookie and add to store
      fetch(`/api/auth/${platform}/status`)
        .then(res => res.json())
        .then(data => {
          if (data.connected && data.connection) {
            addConnection(data.connection);
            if (data.stats) {
              updateStats(platform, data.stats);
            }
          }
        })
        .catch(console.error)
        .finally(() => {
          router.replace('/settings');
        });
    } else if (connected) {
      // Another platform was connected, just redirect
      router.replace('/settings');
    }
  }, [searchParams, router, platform, addConnection, updateStats]);

  return null;
}