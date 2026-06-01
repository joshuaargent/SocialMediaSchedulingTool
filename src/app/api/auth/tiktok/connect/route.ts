import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const clientId = process.env.TIKTOK_CLIENT_ID;
  
  if (!clientId) {
    return NextResponse.redirect(
      new URL('/settings?error=no_tiktok_config', request.url)
    );
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/tiktok/callback`;
  const scope = 'user.info.basic,video.upload,video.publish';
  
  const authUrl = new URL('https://www.tiktok.com/v2/auth/authorize/');
  authUrl.searchParams.set('client_key', clientId);
  authUrl.searchParams.set('scope', scope);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('state', crypto.randomUUID());

  return NextResponse.redirect(authUrl.toString());
}