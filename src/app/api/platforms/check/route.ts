import { NextRequest, NextResponse } from 'next/server';

// GET - Check which platforms have tokens (reads httpOnly cookies on server)
export async function GET(request: NextRequest) {
  const cookies = request.cookies;
  
  const platforms = {
    youtube: cookies.get('yt_access_token')?.value ? true : false,
    tiktok: cookies.get('tt_access_token')?.value ? true : false,
    facebook: cookies.get('fb_access_token')?.value ? true : false,
    instagram: cookies.get('ig_access_token')?.value ? true : false,
  };
  
  return NextResponse.json({ platforms });
}
