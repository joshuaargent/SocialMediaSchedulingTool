import { NextRequest, NextResponse } from 'next/server';
import { isDatabaseConfigured, requirePrisma } from '@/lib/db/prisma';

// GET - Fetch posts for organization
export async function GET(request: NextRequest) {
  try {
    const orgId = request.cookies.get('current_org_id')?.value;
    
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 401 });
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ posts: [], error: 'Database not configured' }, { status: 500 });
    }

    const posts = await requirePrisma().post.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
    });

    // Transform to frontend format
    const formattedPosts = posts.map((post) => ({
      id: post.id,
      organizationId: post.organizationId,
      userId: post.userId,
      content: post.content,
      mediaUrls: post.mediaUrls,
      platforms: post.platforms,
      scheduledAt: post.scheduledAt,
      status: post.status,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      contentType: post.contentType,
      postType: post.postType,
      tags: post.tags,
      isEvergreen: post.isEvergreen,
      evergreenIntervalDays: post.evergreenIntervalDays,
    }));

    return NextResponse.json({ posts: formattedPosts });

  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// POST - Create a new post
export async function POST(request: NextRequest) {
  try {
    const orgId = request.cookies.get('current_org_id')?.value;
    const userId = request.cookies.get('current_user_id')?.value;
    
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 401 });
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { content, mediaUrls, platforms, scheduledAt, status, tags, contentType, postType, youtubeTitle, youtubeDescription, youtubeTags, youtubePrivacyStatus, campaignId } = body;

    const post = await requirePrisma().post.create({
      data: {
        organizationId: orgId,
        userId: userId || 'unknown',
        content: content || '',
        mediaUrls: mediaUrls || [],
        platforms: platforms || [],
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: status || 'draft',
        tags: tags || [],
        contentType,
        postType,
        youtubeTitle,
        youtubeDescription,
        youtubeTags: youtubeTags || [],
        youtubePrivacyStatus: youtubePrivacyStatus || 'public',
        campaignId,
      },
    });

    return NextResponse.json({ success: true, post });

  } catch (error) {
    console.error('Failed to create post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
