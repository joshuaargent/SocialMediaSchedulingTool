import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const error = request.nextUrl.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL(`/settings?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/settings?error=no_code', request.url)
    );
  }

  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/youtube/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL('/settings?error=no_youtube_config', request.url)
    );
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();

    // Fetch YouTube channel info to get subscriber count
    let youtubeStats = {
      subscribers: 0,
      channelId: '',
      channelTitle: '',
    };
    
    try {
      // Get channel details with stats
      const channelResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true`,
        { headers: { 'Authorization': `Bearer ${tokenData.access_token}` }}
      );
      const channelData = await channelResponse.json();
      
      if (channelData.items && channelData.items[0]) {
        const channel = channelData.items[0];
        youtubeStats = {
          subscribers: parseInt(channel.statistics.subscriberCount) || 0,
          channelId: channel.id as string || '',
          channelTitle: channel.snippet.title,
        };
      }
    } catch (ytError) {
      console.error('Failed to fetch YouTube channel info:', ytError);
    }

    // Encode stats in a visible cookie for client to read
    const statsCookie = JSON.stringify(youtubeStats);
    const response = NextResponse.redirect(
      new URL('/settings?connected=youtube', request.url)
    );

    response.cookies.set('yt_access_token', tokenData!.access_token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600,
    });

    if (tokenData!.refresh_token) {
      response.cookies.set('yt_refresh_token', tokenData!.refresh_token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 60,
      });
    }

    // Store stats in cookie for client sync
    response.cookies.set('yt_stats', statsCookie, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (err) {
    return NextResponse.redirect(
      new URL('/settings?error=auth_failed', request.url)
    );
  }
}