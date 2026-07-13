import { NextRequest, NextResponse } from 'next/server';
import { isDatabaseConfigured, requirePrisma } from '@/lib/db/prisma';
import crypto from 'crypto';
import fs from 'fs';

// ============================================
// AGENT VIDEOS - Manage local video references
// ============================================

// GET - Get videos for device
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');

    if (!deviceId) {
      return NextResponse.json({ error: 'Device ID required' }, { status: 400 });
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const videos = await requirePrisma().localVideo.findMany({
      where: { deviceId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ videos });

  } catch (error) {
    console.error('Failed to fetch videos:', error);
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}

// POST - Register a new local video
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId, organizationId, path, filename, size, mimeType, hash } = body;

    if (!deviceId || !organizationId || !path || !filename) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Check for duplicate by hash (if provided) or path
    const existingVideo = await requirePrisma().localVideo.findFirst({
      where: {
        deviceId,
        OR: [
          { hash: hash || undefined },
          { path },
        ],
      },
    });

    if (existingVideo) {
      return NextResponse.json({ 
        success: true, 
        video: existingVideo,
        duplicate: true,
      });
    }

    const video = await requirePrisma().localVideo.create({
      data: {
        deviceId,
        organizationId,
        path,
        filename,
        size: size || null,
        mimeType: mimeType || null,
        hash: hash || null,
        status: 'pending',
        lastModified: new Date(),
      },
    });

    return NextResponse.json({ success: true, video, duplicate: false });

  } catch (error) {
    console.error('Failed to register video:', error);
    return NextResponse.json({ error: 'Failed to register video' }, { status: 500 });
  }
}
