'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { SocialPlatform } from '@/types';

interface OAuthCallbackHandlerProps {
  platform: SocialPlatform;
}

export function OAuthCallbackHandler({ platform }: OAuthCallbackHandlerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');
    
    if (error) {
      router.replace('/settings');
      return;
    }
    
    // When we see ?connected=xxx, the OAuth flow was successful
    // The global OAuthConnectionSync will handle adding the connection
    if (connected === platform) {
      router.replace('/settings');
    } else if (connected) {
      router.replace('/settings');
    }
  }, [searchParams, router, platform]);

  return null;
}