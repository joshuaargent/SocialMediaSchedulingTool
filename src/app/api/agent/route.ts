import { NextRequest, NextResponse } from 'next/server';
import { isDatabaseConfigured, requirePrisma } from '@/lib/db/prisma';
import crypto from 'crypto';

// ============================================
// AGENT API - Device Registration & Management
// ============================================

// POST - Register a new device (desktop agent)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, userId, name, platform, hostname, deviceType } = body;

    if (!organizationId || !userId || !name || !platform) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Generate a unique device token for authentication
    const deviceToken = crypto.randomBytes(32).toString('hex');

    const device = await requirePrisma().device.create({
      data: {
        organizationId,
        userId,
        name,
        platform,
        hostname,
        deviceType: deviceType || 'desktop',
        status: 'online',
        lastHeartbeat: new Date(),
        settings: {},
      },
    });

    return NextResponse.json({ 
      success: true, 
      device: {
        id: device.id,
        name: device.name,
        platform: device.platform,
        deviceToken,
      }
    });

  } catch (error) {
    console.error('Failed to register device:', error);
    return NextResponse.json({ error: 'Failed to register device' }, { status: 500 });
  }
}

// GET - Get devices for organization
export async function GET(request: NextRequest) {
  try {
    const orgId = request.cookies.get('current_org_id')?.value;
    
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 401 });
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const devices = await requirePrisma().device.findMany({
      where: { organizationId: orgId, isActive: true },
      include: {
        watchFolders: true,
        _count: {
          select: { localVideos: true },
        },
      },
      orderBy: { lastHeartbeat: 'desc' },
    });

    // Mark offline devices (no heartbeat in last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const formattedDevices = devices.map((device) => ({
      id: device.id,
      name: device.name,
      platform: device.platform,
      hostname: device.hostname,
      deviceType: device.deviceType,
      status: device.lastHeartbeat < fiveMinutesAgo ? 'offline' : device.status,
      lastHeartbeat: device.lastHeartbeat,
      watchFolders: device.watchFolders,
      localVideoCount: device._count.localVideos,
    }));

    return NextResponse.json({ devices: formattedDevices });

  } catch (error) {
    console.error('Failed to fetch devices:', error);
    return NextResponse.json({ error: 'Failed to fetch devices' }, { status: 500 });
  }
}
