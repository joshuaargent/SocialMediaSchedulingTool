import { NextRequest, NextResponse } from 'next/server';
import { isDatabaseConfigured, requirePrisma } from '@/lib/db/prisma';

// ============================================
// AGENT HEARTBEAT - Device stays connected
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId, status, watchFolders } = body;

    if (!deviceId) {
      return NextResponse.json({ error: 'Device ID required' }, { status: 400 });
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Update device heartbeat
    const device = await requirePrisma().device.update({
      where: { id: deviceId },
      data: {
        lastHeartbeat: new Date(),
        status: status || 'online',
      },
    });

    return NextResponse.json({ 
      success: true, 
      status: device.status,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Failed to update heartbeat:', error);
    return NextResponse.json({ error: 'Failed to update heartbeat' }, { status: 500 });
  }
}
