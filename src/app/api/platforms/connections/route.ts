import { NextRequest, NextResponse } from 'next/server';
import { isDatabaseConfigured, requirePrisma } from '@/lib/db/prisma';

const CACHE_TTL = 5 * 60 * 1000;
let connectionsCache: { data: any; timestamp: number } | null = null;

// GET - Fetch all platform connections for the organization
export async function GET(request: NextRequest) {
  try {
    const orgId = request.cookies.get('current_org_id')?.value;
    
    // If no org ID, return empty (user not logged in)
    // The OAuthConnectionSync will fall back to cookies
    if (!orgId) {
      return NextResponse.json({ 
        connections: [], 
        message: 'Not logged in - using cookie-based connections' 
      });
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ 
        connections: [], 
        error: 'Database not configured' 
      }, { status: 500 });
    }

    const connections = await requirePrisma().platformConnection.findMany({
      where: { organizationId: orgId },
    });

    const formattedConnections = connections.map((conn) => ({
      id: conn.id,
      platform: conn.platform,
      connectedAt: conn.createdAt,
      platformUserId: conn.platformUserId,
      displayName: conn.displayName,
      profileImage: conn.profileImage,
      followers: conn.followers,
      accessToken: conn.accessToken,
      refreshToken: conn.refreshToken,
      expiresAt: conn.expiresAt,
    }));

    return NextResponse.json({
      connections: formattedConnections,
      platformStats: {},
    });

  } catch (error) {
    console.error('Failed to fetch platform connections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connections', connections: [] },
      { status: 500 }
    );
  }
}

// POST - Save a new platform connection
export async function POST(request: NextRequest) {
  try {
    const orgId = request.cookies.get('current_org_id')?.value;
    
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 401 });
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { platform, accessToken, refreshToken, platformUserId, displayName, profileImage, followers, expiresAt } = body;

    const connection = await requirePrisma().platformConnection.upsert({
      where: {
        organizationId_platform: {
          organizationId: orgId,
          platform,
        },
      },
      update: {
        accessToken,
        refreshToken,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        platformUserId,
        displayName,
        profileImage,
        followers,
        updatedAt: new Date(),
      },
      create: {
        organizationId: orgId,
        platform,
        accessToken,
        refreshToken,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        platformUserId,
        displayName,
        profileImage,
        followers,
      },
    });

    return NextResponse.json({ 
      success: true, 
      connection: {
        id: connection.id,
        platform: connection.platform,
        connectedAt: connection.createdAt,
      }
    });

  } catch (error) {
    console.error('Failed to save platform connection:', error);
    return NextResponse.json(
      { error: 'Failed to save connection' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a platform connection
export async function DELETE(request: NextRequest) {
  try {
    const orgId = request.cookies.get('current_org_id')?.value;
    const platform = request.nextUrl.searchParams.get('platform');
    
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 401 });
    }

    if (!platform) {
      return NextResponse.json({ error: 'Platform required' }, { status: 400 });
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    await requirePrisma().platformConnection.delete({
      where: {
        organizationId_platform: {
          organizationId: orgId,
          platform,
        },
      },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Failed to delete platform connection:', error);
    return NextResponse.json(
      { error: 'Failed to delete connection' },
      { status: 500 }
    );
  }
}
