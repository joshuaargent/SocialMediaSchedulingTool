import { NextRequest, NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/db/prisma';

const DEFAULT_ORG_ID = 'default-org';

// GET /api/db/posts/[id] - Get single post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if database is configured
    if (!isDatabaseConfigured() || !prisma) {
      return NextResponse.json({ error: 'Database not configured', post: null }, { status: 200 });
    }

    const { id } = await params;
    
    const post = await prisma.post.findFirst({
      where: { id, organizationId: DEFAULT_ORG_ID },
      include: {
        user: { select: { id: true, name: true, email: true } },
        campaign: { select: { id: true, name: true, color: true } },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

// PATCH /api/db/posts/[id] - Update post
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if database is configured
    if (!isDatabaseConfigured() || !prisma) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 200 });
    }

    const { id } = await params;
    const body = await request.json();

    const post = await prisma.post.updateMany({
      where: { id, organizationId: DEFAULT_ORG_ID },
      data: {
        content: body.content,
        mediaUrls: body.mediaUrls,
        platforms: body.platforms,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
        status: body.status,
        contentType: body.contentType,
        postType: body.postType,
        isEvergreen: body.isEvergreen,
        evergreenIntervalDays: body.evergreenIntervalDays,
        tags: body.tags,
        youtubeTitle: body.youtubeTitle,
        youtubeDescription: body.youtubeDescription,
        youtubeTags: body.youtubeTags,
        youtubePrivacyStatus: body.youtubePrivacyStatus,
        campaignId: body.campaignId,
      },
    });

    if (post.count === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const updatedPost = await prisma.post.findFirst({
      where: { id, organizationId: DEFAULT_ORG_ID },
    });

    return NextResponse.json({ post: updatedPost });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

// DELETE /api/db/posts/[id] - Delete post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if database is configured
    if (!isDatabaseConfigured() || !prisma) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 200 });
    }

    const { id } = await params;

    const post = await prisma.post.deleteMany({
      where: { id, organizationId: DEFAULT_ORG_ID },
    });

    if (post.count === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}