import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  
  if (!clientId) {
    return NextResponse.redirect(
      new URL('/settings?error=no_youtube_config', request.url)
    );
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/youtube/callback`;
  
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/yt-analytics.readonly');
  authUrl.searchParams.set('access_type', 'offline');

  return NextResponse.redirect(authUrl.toString());
}