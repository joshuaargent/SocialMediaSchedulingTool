import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

const DEFAULT_ORG_ID = 'default-org';
const DEFAULT_USER_ID = 'default-user';

// GET /api/db/posts - List all posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const platform = searchParams.get('platform');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = { organizationId: DEFAULT_ORG_ID };
    if (status) where.status = status;
    if (platform) where.platforms = { has: platform };

    const posts = await prisma.post.findMany({
      where,
      orderBy: { scheduledAt: 'asc' },
      take: limit,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// POST /api/db/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const post = await prisma.post.create({
      data: {
        organizationId: DEFAULT_ORG_ID,
        userId: DEFAULT_USER_ID,
        content: body.content,
        mediaUrls: body.mediaUrls || [],
        platforms: body.platforms || [],
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
        status: body.scheduledAt ? 'scheduled' : 'draft',
        contentType: body.contentType,
        postType: body.postType,
        isEvergreen: body.isEvergreen || false,
        evergreenIntervalDays: body.evergreenIntervalDays,
        tags: body.tags || [],
        youtubeTitle: body.youtubeTitle,
        youtubeDescription: body.youtubeDescription,
        youtubeTags: body.youtubeTags || [],
        youtubePrivacyStatus: body.youtubePrivacyStatus || 'public',
        campaignId: body.campaignId,
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}