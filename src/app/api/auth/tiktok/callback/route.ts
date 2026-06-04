import { NextRequest, NextResponse } from 'next/server';
import { isDatabaseConfigured, requirePrisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const error = request.nextUrl.searchParams.get('error');
  const errorDescription = request.nextUrl.searchParams.get('error_description');

  if (error) {
    const redirectUrl = new URL('/settings', request.url);
    redirectUrl.searchParams.set('error', errorDescription || error);
    return NextResponse.redirect(redirectUrl);
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/settings?error=no_code', request.url)
    );
  }

  const clientId = process.env.TIKTOK_CLIENT_ID;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/tiktok/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL('/settings?error=no_tiktok_config', request.url)
    );
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_key: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      const redirectUrl = new URL('/settings', request.url);
      redirectUrl.searchParams.set('error', errorData.error_description || errorData.error || 'auth_failed');
      return NextResponse.redirect(redirectUrl);
    }

    const tokenData = await tokenResponse.json();
    const redirectUrl = new URL('/settings', request.url);
    redirectUrl.searchParams.set('connected', 'tiktok');
    const response = NextResponse.redirect(redirectUrl);

    // Store in database if configured
    const orgId = request.cookies.get('current_org_id')?.value;
    if (orgId && isDatabaseConfigured()) {
      try {
        await requirePrisma().platformConnection.upsert({
          where: {
            organizationId_platform: {
              organizationId: orgId,
              platform: 'tiktok',
            },
          },
          update: {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresAt: new Date(Date.now() + (tokenData.expires_in * 1000)),
          },
          create: {
            organizationId: orgId,
            platform: 'tiktok',
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresAt: new Date(Date.now() + (tokenData.expires_in * 1000)),
          },
        });
      } catch (dbError) {
        console.error('Failed to save TikTok connection to database:', dbError);
      }
    }

    // Also set cookies for backward compatibility
    response.cookies.set('tt_access_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenData.expires_in || 3600,
    });

    if (tokenData.refresh_token) {
      response.cookies.set('tt_refresh_token', tokenData.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 60,
      });
    }

    return response;
  } catch (err) {
    return NextResponse.redirect(
      new URL('/settings?error=auth_failed', request.url)
    );
  }
}