import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const platform = request.nextUrl.searchParams.get('platform');
  
  // Get tokens from cookies (set by OAuth callback routes)
  const platformTokens: Record<string, { accessToken?: string; refreshToken?: string }> = {
    tiktok: {
      accessToken: request.cookies.get('tiktok_access_token')?.value,
      refreshToken: request.cookies.get('tiktok_refresh_token')?.value,
    },
    facebook: {
      accessToken: request.cookies.get('fb_access_token')?.value,
      refreshToken: request.cookies.get('fb_refresh_token')?.value,
    },
    instagram: {
      accessToken: request.cookies.get('ig_access_token')?.value,
    },
    youtube: {
      accessToken: request.cookies.get('yt_access_token')?.value,
      refreshToken: request.cookies.get('yt_refresh_token')?.value,
    },
  };

  const targetPlatform = platform || 'tiktok';
  const tokens = platformTokens[targetPlatform];

  if (!tokens?.accessToken) {
    return NextResponse.json({ connected: false });
  }

  // Return connection info (client will store it)
  return NextResponse.json({
    connected: true,
    connection: {
      platform: targetPlatform,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    },
    stats: null,
  });
}