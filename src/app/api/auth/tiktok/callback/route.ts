import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code, platform } = await request.json();

    if (!code || !platform) {
      return NextResponse.json(
        { error: 'Authorization code and platform are required' },
        { status: 400 }
      );
    }

    const clientId = process.env[`${platform.toUpperCase()}_CLIENT_ID`];
    const clientSecret = process.env[`${platform.toUpperCase()}_CLIENT_SECRET`];

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: `${platform} OAuth not configured. Please set environment variables.` },
        { status: 503 }
      );
    }

    // Platform-specific token exchange URLs and configs
    const platformConfigs: Record<string, { tokenUrl: string; scope: string }> = {
      tiktok: {
        tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token/',
        scope: 'user.info.basic,video.upload,video.publish',
      },
      facebook: {
        tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
        scope: 'pages_manage_posts,pages_read_engagement,instagram_basic,instagram_manage_insights',
      },
      instagram: {
        tokenUrl: 'https://api.instagram.com/oauth/access_token',
        scope: 'user_profile,user_media',
      },
      youtube: {
        tokenUrl: 'https://oauth2.googleapis.com/token',
        scope: 'https://www.googleapis.com/auth/youtube.upload,https://www.googleapis.com/auth/youtube',
      },
    };

    const config = platformConfigs[platform];
    if (!config) {
      return NextResponse.json(
        { error: 'Invalid platform' },
        { status: 400 }
      );
    }

    // Exchange code for access token
    const tokenResponse = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/${platform}/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error_description || errorData.error || 'Failed to get access token' },
        { status: 400 }
      );
    }

    const tokenData = await tokenResponse.json();

    // Return success with tokens (in production, you'd also fetch user profile data)
    return NextResponse.json({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      platformUserId: tokenData.open_id || tokenData.user_id || 'unknown',
      platformUsername: tokenData.username || '',
      userId: 'current-user',
      organizationId: 'default-org',
      scopes: tokenData.scope?.split(' ') || config.scope.split(','),
    });
  } catch (error) {
    console.error('OAuth error:', error);
    return NextResponse.json(
      { error: 'Failed to complete authentication' },
      { status: 500 }
    );
  }
}