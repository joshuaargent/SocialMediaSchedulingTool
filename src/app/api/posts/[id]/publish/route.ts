import { NextRequest, NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/db/prisma';
import { auth } from '@/auth';

// POST /api/posts/[id]/publish - Publish a post to platforms
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if database is configured
    if (!isDatabaseConfigured() || !prisma) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 200 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { platform } = body;

    // Get the post
    const post = await prisma.post.findFirst({
      where: { id, organizationId: session.user.organizationId },
      include: {
        organization: {
          include: {
            platformConnections: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.status === 'published') {
      return NextResponse.json({ error: 'Post already published' }, { status: 400 });
    }

    const platforms = platform ? [platform] : post.platforms;
    const results: Record<string, { success: boolean; error?: string; postId?: string }> = {};

    // Publish to each platform
    for (const p of platforms) {
      try {
        const connection = post.organization.platformConnections.find(
          (c: { platform: string }) => c.platform === p
        );

        if (!connection) {
          results[p] = { success: false, error: 'Platform not connected' };
          continue;
        }

        // Platform-specific publishing logic
        if (p === 'tiktok') {
          // TikTok API call would go here
          results[p] = { success: true, postId: `tt_${Date.now()}` };
        } else if (p === 'facebook') {
          // Facebook API call would go here
          results[p] = { success: true, postId: `fb_${Date.now()}` };
        } else if (p === 'instagram') {
          // Instagram API call would go here
          results[p] = { success: true, postId: `ig_${Date.now()}` };
        } else if (p === 'youtube') {
          // YouTube API call would go here
          results[p] = { success: true, postId: `yt_${Date.now()}` };
        }

        // Record in posting history
        await prisma.postingHistory.create({
          data: {
            organizationId: session.user.organizationId,
            postId: post.id,
            platform: p,
            publishedAt: new Date(),
            views: 0,
            likes: 0,
            comments: 0,
            shares: 0,
            saves: 0,
            reach: 0,
            impressions: 0,
          },
        });
      } catch (error) {
        console.error(`Failed to publish to ${p}:`, error);
        results[p] = { success: false, error: 'Publishing failed' };
      }
    }

    // Update post status
    await prisma.post.update({
      where: { id: post.id },
      data: {
        status: 'published',
        publishedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      results,
      publishedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Publish error:', error);
    return NextResponse.json({ error: 'Failed to publish' }, { status: 500 });
  }
}