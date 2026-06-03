import { NextRequest, NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/db/prisma';
import { auth } from '@/auth';

// GET /api/db/posts - List all posts
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if database is configured
    if (!isDatabaseConfigured() || !prisma) {
      return NextResponse.json({ 
        posts: [], 
        message: 'Database not configured. Using local storage.' 
      }, { status: 200 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const platform = searchParams.get('platform');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = { organizationId: session.user.organizationId };
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
    return NextResponse.json({ 
      posts: [],
      error: 'Failed to fetch posts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/db/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if database is configured
    if (!isDatabaseConfigured() || !prisma) {
      return NextResponse.json({ 
        post: null, 
        message: 'Database not configured. Post saved locally.',
        savedLocally: true 
      }, { status: 200 });
    }

    const body = await request.json();
    
    const post = await prisma.post.create({
      data: {
        organizationId: session.user.organizationId,
        userId: session.user.id,
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
    return NextResponse.json({ 
      error: 'Failed to create post',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}