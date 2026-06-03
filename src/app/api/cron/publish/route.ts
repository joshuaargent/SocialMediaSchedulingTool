import { NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/db/prisma';

// This endpoint is meant to be called by Vercel Cron
// Configure in vercel.json: { "crons": [{ "path": "/api/cron/publish", "schedule": "* * * * *" }] }
// Note: This processes scheduled posts for ALL organizations

// GET /api/cron/publish - Auto-publish scheduled posts
export async function GET() {
  try {
    // Check if database is configured
    if (!isDatabaseConfigured() || !prisma) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database not configured',
        published: 0 
      }, { status: 200 });
    }

    const now = new Date();
    
    // Find posts that are scheduled to be published (across all organizations)
    const postsToPublish = await prisma.post.findMany({
      where: {
        status: 'scheduled',
        scheduledAt: {
          lte: now,
        },
      },
      include: {
        organization: {
          include: {
            platformConnections: {
              select: {
                platform: true,
                accessToken: true,
              },
            },
          },
        },
      },
    });

    const results: { postId: string; organizationId: string; platforms: string[]; success: boolean }[] = [];

    for (const post of postsToPublish) {
      const publishResults: string[] = [];

      for (const platform of post.platforms) {
        try {
          const connection = post.organization.platformConnections.find(
            (c: { platform: string }) => c.platform === platform
          );

          if (connection) {
            // Platform publish logic would go here
            // This is simplified - real implementation needs OAuth token refresh and API calls
            
            publishResults.push(platform);

            // Record posting history using the post's actual organizationId
            await prisma.postingHistory.create({
              data: {
                organizationId: post.organizationId,
                postId: post.id,
                platform,
                publishedAt: now,
                views: 0,
                likes: 0,
                comments: 0,
                shares: 0,
                saves: 0,
                reach: 0,
                impressions: 0,
              },
            });
          }
        } catch (error) {
          console.error(`Failed to publish ${post.id} to ${platform}:`, error);
        }
      }

      if (publishResults.length > 0) {
        // Update post status
        await prisma.post.update({
          where: { id: post.id },
          data: {
            status: 'published',
            publishedAt: now,
          },
        });

        results.push({
          postId: post.id,
          organizationId: post.organizationId,
          platforms: publishResults,
          success: true,
        });
      }
    }

    // Process evergreen posts (across all organizations)
    const evergreenPosts = await prisma.post.findMany({
      where: {
        isEvergreen: true,
        status: 'published',
      },
    });

    for (const post of evergreenPosts) {
      if (post.evergreenIntervalDays && post.publishedAt) {
        const nextPostDate = new Date(post.publishedAt);
        nextPostDate.setDate(nextPostDate.getDate() + post.evergreenIntervalDays);

        if (now >= nextPostDate) {
          // Create a new post instance using the original post's organizationId
          await prisma.post.create({
            data: {
              organizationId: post.organizationId,
              userId: post.userId,
              content: post.content,
              mediaUrls: post.mediaUrls,
              platforms: post.platforms,
              scheduledAt: now,
              status: 'scheduled',
              contentType: post.contentType,
              postType: post.postType,
              isEvergreen: post.isEvergreen,
              evergreenIntervalDays: post.evergreenIntervalDays,
              tags: post.tags,
              campaignId: post.campaignId,
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      published: results.length,
      details: results,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
  }
}