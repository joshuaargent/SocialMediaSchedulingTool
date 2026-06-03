import { NextRequest, NextResponse } from 'next/server';
import { usePlatformStore } from '@/stores';

// Cache for data
let postCache: { posts: any[]; summary: any; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// GET /api/analytics/facebook/posts - Get Facebook post analytics
export async function GET(request: NextRequest) {
  try {
    const platformStore = usePlatformStore.getState();
    const connections = platformStore.connections;
    
    // Check cache first
    if (postCache && Date.now() - postCache.timestamp < CACHE_TTL) {
      return NextResponse.json({
        connected: true,
        platform: 'facebook',
        ...postCache,
        cached: true,
      });
    }
    
    // Find Facebook connection
    const fbConnection = connections.find((c) => c.platform === 'facebook');
    if (!fbConnection?.accessToken || fbConnection.accessToken === 'connected_via_oauth') {
      if (postCache) {
        return NextResponse.json({
          connected: true,
          platform: 'facebook',
          ...postCache,
          cached: true,
          stale: true,
        });
      }
      return NextResponse.json({ 
        error: 'Facebook is not connected',
        connected: false 
      }, { status: 404 });
    }

    const accessToken = fbConnection.accessToken;
    const days = parseInt(request.nextUrl.searchParams.get('days') || '30');
    
    // Facebook Graph API - Fetch page posts
    try {
      // Get page info and posts
      const pageResponse = await fetch(
        `https://graph.facebook.com/v18.0/me?fields=id,name,posts{full_picture,message,created_time,likes.summary(true),comments.summary(true),shares}&access_token=${accessToken}&limit=50`
      );
      const pageData = await pageResponse.json();
      
      if (pageData.error) {
        throw new Error(pageData.error.message);
      }
      
      const posts = (pageData.posts?.data || []).map((post: any) => ({
        id: post.id,
        title: post.message?.slice(0, 50) || 'Facebook Post',
        description: post.message || '',
        publishedAt: post.created_time,
        thumbnail: post.full_picture || null,
        stats: {
          likes: post.likes?.summary?.total_count || 0,
          comments: post.comments?.summary?.total_count || 0,
          shares: post.shares?.count || 0,
        },
      }));
      
      const summary = {
        totalPosts: posts.length,
        totalLikes: posts.reduce((sum: number, p: any) => sum + p.stats.likes, 0),
        totalComments: posts.reduce((sum: number, p: any) => sum + p.stats.comments, 0),
        totalShares: posts.reduce((sum: number, p: any) => sum + p.stats.shares, 0),
        avgLikesPerPost: posts.length > 0 ? Math.round(posts.reduce((sum: number, p: any) => sum + p.stats.likes, 0) / posts.length) : 0,
      };

      postCache = { posts, summary, timestamp: Date.now() };

      return NextResponse.json({
        connected: true,
        platform: 'facebook',
        summary,
        posts,
        period: { days },
      });
    } catch (apiError) {
      console.error('Facebook API error:', apiError);
      
      // Return mock data for demo
      const mockPosts = Array.from({ length: 10 }, (_, i) => ({
        id: `mock_fb_${i}`,
        title: `Sample Facebook Post ${i + 1}`,
        description: 'Sample post content...',
        publishedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        thumbnail: null,
        stats: {
          likes: Math.floor(Math.random() * 5000) + 50,
          comments: Math.floor(Math.random() * 500) + 5,
          shares: Math.floor(Math.random() * 200) + 5,
        },
      }));
      
      const summary = {
        totalPosts: mockPosts.length,
        totalLikes: mockPosts.reduce((sum: number, p: any) => sum + p.stats.likes, 0),
        totalComments: mockPosts.reduce((sum: number, p: any) => sum + p.stats.comments, 0),
        totalShares: mockPosts.reduce((sum: number, p: any) => sum + p.stats.shares, 0),
        avgLikesPerPost: Math.round(mockPosts.reduce((sum: number, p: any) => sum + p.stats.likes, 0) / mockPosts.length),
      };
      
      postCache = { posts: mockPosts, summary, timestamp: Date.now() };

      return NextResponse.json({
        connected: true,
        platform: 'facebook',
        summary,
        posts: mockPosts,
        period: { days },
        demo: true,
      });
    }
  } catch (error) {
    console.error('Facebook posts API error:', error);
    
    if (postCache) {
      return NextResponse.json({
        connected: true,
        platform: 'facebook',
        ...postCache,
        cached: true,
        stale: true,
        error: 'Using cached data due to API error',
      });
    }
    
    return NextResponse.json({ 
      error: 'Failed to fetch Facebook posts',
      connected: false 
    }, { status: 500 });
  }
}