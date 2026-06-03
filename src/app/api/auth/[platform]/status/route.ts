import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma, isDatabaseConfigured } from '@/lib/db/prisma';
import type { SocialPlatform } from '@/types';

// GET /api/auth/[platform]/status - Get connection status for a platform
export async function GET(
  request: Request,
  { params }: { params: Promise<{ platform: string }> }
) {
  try {
    const { platform } = await params;
    const validPlatforms: SocialPlatform[] = ['tiktok', 'facebook', 'instagram', 'youtube'];
    
    if (!validPlatforms.includes(platform as SocialPlatform)) {
      return NextResponse.json({ connected: false, error: 'Invalid platform' }, { status: 400 });
    }

    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ connected: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Check if platform connection exists in database
    if (isDatabaseConfigured() && prisma) {
      const connection = await prisma.platformConnection.findUnique({
        where: {
          organizationId_platform: {
            organizationId: session.user.organizationId,
            platform: platform as SocialPlatform,
          },
        },
      });

      if (connection) {
        return NextResponse.json({
          connected: true,
          connection: {
            platform: connection.platform,
            accessToken: connection.accessToken,
            platformUserId: connection.platformUserId,
            displayName: connection.displayName,
            profileImage: connection.profileImage,
            followers: connection.followers,
          },
        });
      }
    }

    // Also check cookies for recently connected platforms
    const cookies = request.headers.get('cookie') || '';
    
    // Map platform names to cookie names
    const cookieMap: Record<string, { access: string; refresh?: string }> = {
      tiktok: { access: 'tt_access_token', refresh: 'tt_refresh_token' },
      youtube: { access: 'yt_access_token', refresh: 'yt_refresh_token' },
      facebook: { access: 'fb_access_token', refresh: 'fb_refresh_token' },
      instagram: { access: 'ig_access_token' },
    };

    const platformCookies = cookieMap[platform];
    if (platformCookies) {
      const hasAccessToken = cookies.includes(`${platformCookies.access}=`);
      
      if (hasAccessToken) {
        return NextResponse.json({
          connected: true,
          connection: {
            platform: platform as SocialPlatform,
            accessToken: 'stored_in_cookie',
            platformUserId: 'unknown',
          },
        });
      }
    }

    return NextResponse.json({ connected: false });
  } catch (error) {
    console.error('Platform status error:', error);
    return NextResponse.json({ connected: false, error: 'Failed to check status' }, { status: 500 });
  }
}