import { NextRequest, NextResponse } from 'next/server';
import { isDatabaseConfigured, requirePrisma } from '@/lib/db/prisma';

// ============================================
// AGENT SCHEDULED POSTS - Get posts for this device
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');

    if (!deviceId) {
      return NextResponse.json({ error: 'Device ID required' }, { status: 400 });
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Get posts scheduled for this device that are due
    const now = new Date();
    const oneMinuteFromNow = new Date(now.getTime() + 60 * 1000);

    const scheduledPosts = await requirePrisma().post.findMany({
      where: {
        deviceId: deviceId,
        publishMethod: 'local',
        status: 'scheduled',
        scheduledAt: {
          lte: oneMinuteFromNow,
          gte: new Date(now.getTime() - 60 * 1000), // Within last minute (for edge cases)
        },
      },
      include: {
        localVideos: {
          where: { status: 'scheduled' },
        },
        organization: {
          select: { 
            platformConnections: true,
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    const formattedPosts = scheduledPosts.map((post) => ({
      id: post.id,
      content: post.content,
      platforms: post.platforms,
      scheduledAt: post.scheduledAt,
      localVideo: post.localVideos[0] || null,
      youtubeTitle: post.youtubeTitle,
      youtubeDescription: post.youtubeDescription,
      youtubeTags: post.youtubeTags,
      youtubePrivacyStatus: post.youtubePrivacyStatus,
    }));

    return NextResponse.json({ posts: formattedPosts });

  } catch (error) {
    console.error('Failed to fetch scheduled posts:', error);
    return NextResponse.json({ error: 'Failed to fetch scheduled posts' }, { status: 500 });
  }
}

// POST - Mark post as published or failed
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, status, errorMessage, deviceId } = body;

    if (!postId || !status) {
      return NextResponse.json({ error: 'Post ID and status required' }, { status: 400 });
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const updateData: any = {
      status: status === 'published' ? 'published' : 'failed',
    };

    if (status === 'published') {
      updateData.publishedAt = new Date();
    }

    if (errorMessage) {
      updateData.errorMessage = errorMessage;
    }

    const post = await requirePrisma().post.update({
      where: { id: postId },
      data: updateData,
    });

    // Update local video status if applicable
    if (deviceId) {
      await requirePrisma().localVideo.updateMany({
        where: {
          deviceId: deviceId,
          postId: postId,
          status: 'scheduled',
        },
        data: {
          status: status === 'published' ? 'published' : 'failed',
        },
      });
    }

    return NextResponse.json({ success: true, post });

  } catch (error) {
    console.error('Failed to update post status:', error);
    return NextResponse.json({ error: 'Failed to update post status' }, { status: 500 });
  }
}
