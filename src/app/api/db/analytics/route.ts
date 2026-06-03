import { NextRequest, NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/db/prisma';
import { auth } from '@/auth';

// GET /api/db/analytics/summary - Get analytics summary
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
        summary: {
          totalPosts: 0,
          totalViews: 0,
          totalEngagement: 0,
          averageEngagementRate: 0,
          platformBreakdown: {},
        },
        algorithmHealth: [],
        message: 'Database not configured'
      }, { status: 200 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get posts stats
    const postsCount = await prisma.post.count({
      where: {
        organizationId: session.user.organizationId,
        status: 'published',
      },
    });

    // Get metrics sum
    const metrics = await prisma.performanceMetrics.findMany({
      where: {
        organizationId: session.user.organizationId,
        collectedAt: { gte: startDate },
      },
    });

    const totalViews = metrics.reduce((sum: number, m: { views: number }) => sum + m.views, 0);
    const totalLikes = metrics.reduce((sum: number, m: { likes: number }) => sum + m.likes, 0);
    const totalComments = metrics.reduce((sum: number, m: { comments: number }) => sum + m.comments, 0);
    const totalShares = metrics.reduce((sum: number, m: { shares: number }) => sum + m.shares, 0);
    const avgEngagementRate = metrics.length > 0 
      ? metrics.reduce((sum: number, m: { engagementRate: number }) => sum + m.engagementRate, 0) / metrics.length 
      : 0;

    // Get platform breakdown
    const platforms = ['tiktok', 'facebook', 'instagram', 'youtube'];
    const platformBreakdown: Record<string, { posts: number; views: number; engagement: number; engagementRate: number }> = {};

    for (const platform of platforms) {
      const platformMetrics = metrics.filter((m: { platform: string }) => m.platform === platform);
      const platformPosts = await prisma.post.count({
        where: {
          organizationId: session.user.organizationId,
          platforms: { has: platform },
          status: 'published',
        },
      });

      platformBreakdown[platform] = {
        posts: platformPosts,
        views: platformMetrics.reduce((sum: number, m: { views: number }) => sum + m.views, 0),
        engagement: platformMetrics.reduce((sum: number, m: { likes: number; comments: number; shares: number }) => sum + m.likes + m.comments + m.shares, 0),
        engagementRate: platformMetrics.length > 0 
          ? platformMetrics.reduce((sum: number, m: { engagementRate: number }) => sum + m.engagementRate, 0) / platformMetrics.length 
          : 0,
      };
    }

    // Get algorithm health
    const algorithmHealth = await prisma.algorithmHealth.findMany({
      where: { organizationId: session.user.organizationId },
    });

    return NextResponse.json({
      summary: {
        totalPosts: postsCount,
        totalViews,
        totalEngagement: totalLikes + totalComments + totalShares,
        averageEngagementRate: avgEngagementRate,
        platformBreakdown,
      },
      algorithmHealth,
      period: { days },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

// POST /api/db/analytics - Add performance metrics
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
        error: 'Database not configured',
        message: 'Metrics not saved'
      }, { status: 200 });
    }

    const body = await request.json();
    const { postId, platform, views, likes, comments, shares } = body;

    const engagementRate = views > 0 ? (likes + comments + shares) / views : 0;

    const metrics = await prisma.performanceMetrics.create({
      data: {
        organizationId: session.user.organizationId,
        postId,
        platform,
        views,
        likes,
        comments,
        shares,
        engagementRate,
      },
    });

    return NextResponse.json({ metrics }, { status: 201 });
  } catch (error) {
    console.error('Error saving metrics:', error);
    return NextResponse.json({ error: 'Failed to save metrics' }, { status: 500 });
  }
}