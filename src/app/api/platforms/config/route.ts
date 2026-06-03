import { NextResponse } from 'next/server';

// GET /api/platforms/config - Check which platforms are configured
export async function GET() {
  const configs = {
    tiktok: {
      configured: !!(process.env.TIKTOK_CLIENT_ID && process.env.TIKTOK_CLIENT_SECRET),
      clientId: process.env.TIKTOK_CLIENT_ID ? '***' + process.env.TIKTOK_CLIENT_ID.slice(-4) : null,
    },
    facebook: {
      configured: !!(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET),
      clientId: process.env.FACEBOOK_CLIENT_ID ? '***' + process.env.FACEBOOK_CLIENT_ID.slice(-4) : null,
    },
    instagram: {
      configured: !!(process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET),
      clientId: process.env.INSTAGRAM_CLIENT_ID ? '***' + process.env.INSTAGRAM_CLIENT_ID.slice(-4) : null,
    },
    youtube: {
      configured: !!(process.env.YOUTUBE_CLIENT_ID && process.env.YOUTUBE_CLIENT_SECRET),
      clientId: process.env.YOUTUBE_CLIENT_ID ? '***' + process.env.YOUTUBE_CLIENT_ID.slice(-4) : null,
    },
  };

  return NextResponse.json({ configs });
}