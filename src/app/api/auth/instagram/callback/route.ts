import { NextRequest, NextResponse } from 'next/server';
import { isDatabaseConfigured, requirePrisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const error = request.nextUrl.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL('/settings?error=' + encodeURIComponent(error), request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/settings?error=no_code', request.url)
    );
  }

  const clientId = process.env.INSTAGRAM_CLIENT_ID;
  const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/instagram/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL('/settings?error=no_instagram_config', request.url)
    );
  }

  try {
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
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
    const response = NextResponse.redirect(
      new URL('/settings?connected=instagram', request.url)
    );

    // Store in database if configured
    const orgId = request.cookies.get('current_org_id')?.value;
    if (orgId && isDatabaseConfigured()) {
      try {
        await requirePrisma().platformConnection.upsert({
          where: {
            organizationId_platform: {
              organizationId: orgId,
              platform: 'instagram',
            },
          },
          update: {
            accessToken: tokenData.access_token,
          },
          create: {
            organizationId: orgId,
            platform: 'instagram',
            accessToken: tokenData.access_token,
          },
        });
      } catch (dbError) {
        console.error('Failed to save Instagram connection to database:', dbError);
      }
    }

    // Also set cookies for backward compatibility
    response.cookies.set('ig_access_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600,
    });

    return response;
  } catch (err) {
    return NextResponse.redirect(
      new URL('/settings?error=auth_failed', request.url)
    );
  }
}
