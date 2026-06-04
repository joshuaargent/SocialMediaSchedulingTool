import { NextRequest, NextResponse } from 'next/server';
import { isDatabaseConfigured, requirePrisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const error = request.nextUrl.searchParams.get('error');
  const errorReason = request.nextUrl.searchParams.get('error_reason');

  if (error) {
    return NextResponse.redirect(
      new URL('/settings?error=' + encodeURIComponent(errorReason || error), request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/settings?error=no_code', request.url)
    );
  }

  const clientId = process.env.FACEBOOK_CLIENT_ID;
  const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/facebook/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL('/settings?error=no_facebook_config', request.url)
    );
  }

  try {
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&code=${code}&redirect_uri=${redirectUri}`
    );

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    const response = NextResponse.redirect(
      new URL('/settings?connected=facebook', request.url)
    );

    // Store in database if configured
    const orgId = request.cookies.get('current_org_id')?.value;
    if (orgId && isDatabaseConfigured()) {
      try {
        await requirePrisma().platformConnection.upsert({
          where: {
            organizationId_platform: {
              organizationId: orgId,
              platform: 'facebook',
            },
          },
          update: {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresAt: tokenData.expires_at ? new Date(tokenData.expires_at * 1000) : null,
          },
          create: {
            organizationId: orgId,
            platform: 'facebook',
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresAt: tokenData.expires_at ? new Date(tokenData.expires_at * 1000) : null,
          },
        });
      } catch (dbError) {
        console.error('Failed to save Facebook connection to database:', dbError);
      }
    }

    // Also set cookies for backward compatibility
    response.cookies.set('fb_access_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600,
    });

    if (tokenData.refresh_token) {
      response.cookies.set('fb_refresh_token', tokenData.refresh_token, {
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
