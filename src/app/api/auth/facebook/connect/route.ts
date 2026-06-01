import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const clientId = process.env.FACEBOOK_CLIENT_ID;
  
  if (!clientId) {
    return NextResponse.redirect(
      new URL('/settings?error=no_facebook_config', request.url)
    );
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/facebook/callback`;
  
  const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('scope', 'pages_manage_posts,pages_read_engagement,instagram_basic,instagram_manage_insights');
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('state', crypto.randomUUID());

  return NextResponse.redirect(authUrl.toString());
}