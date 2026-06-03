import { NextRequest, NextResponse } from 'next/server';
import prisma, { isDatabaseConfigured } from '@/lib/db/prisma';

const DEFAULT_ORG_ID = 'default-org';

// GET /api/db/platforms - Get all platform connections
export async function GET() {
  try {
    // Check if database is configured
    if (!isDatabaseConfigured() || !prisma) {
      return NextResponse.json({ platforms: [] }, { status: 200 });
    }

    const connections = await prisma.platformConnection.findMany({
      where: { organizationId: DEFAULT_ORG_ID },
      orderBy: { platform: 'asc' },
    });

    // Don't return access tokens in response
    const safeConnections = connections.map((c: {
      id: string;
      platform: string;
      platformUserId: string | null;
      displayName: string | null;
      profileImage: string | null;
      followers: number | null;
      expiresAt: Date | null;
      createdAt: Date;
      updatedAt: Date;
      accessToken: string | null;
    }) => ({
      id: c.id,
      platform: c.platform,
      platformUserId: c.platformUserId,
      displayName: c.displayName,
      profileImage: c.profileImage,
      followers: c.followers,
      expiresAt: c.expiresAt,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      isConnected: !!c.accessToken,
    }));

    return NextResponse.json({ platforms: safeConnections });
  } catch (error) {
    console.error('Error fetching platforms:', error);
    return NextResponse.json({ error: 'Failed to fetch platforms' }, { status: 500 });
  }
}

// POST /api/db/platforms - Create/Update platform connection
export async function POST(request: NextRequest) {
  try {
    // Check if database is configured
    if (!isDatabaseConfigured() || !prisma) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 200 });
    }

    const body = await request.json();
    const { platform, accessToken, refreshToken, expiresAt, platformUserId, displayName, profileImage, followers } = body;

    // Upsert connection
    const connection = await prisma.platformConnection.upsert({
      where: {
        organizationId_platform: {
          organizationId: DEFAULT_ORG_ID,
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
      },
      create: {
        organizationId: DEFAULT_ORG_ID,
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
      platform: {
        id: connection.id,
        platform: connection.platform,
        displayName: connection.displayName,
        followers: connection.followers,
        isConnected: true,
      }
    });
  } catch (error) {
    console.error('Error saving platform:', error);
    return NextResponse.json({ error: 'Failed to save platform' }, { status: 500 });
  }
}

// DELETE /api/db/platforms - Disconnect a platform
export async function DELETE(request: NextRequest) {
  try {
    // Check if database is configured
    if (!isDatabaseConfigured() || !prisma) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 200 });
    }

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');

    if (!platform) {
      return NextResponse.json({ error: 'Platform is required' }, { status: 400 });
    }

    await prisma.platformConnection.delete({
      where: {
        organizationId_platform: {
          organizationId: DEFAULT_ORG_ID,
          platform,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting platform:', error);
    return NextResponse.json({ error: 'Failed to disconnect platform' }, { status: 500 });
  }
}