import { NextRequest, NextResponse } from 'next/server';
import { isDatabaseConfigured, requirePrisma } from '@/lib/db/prisma';

// ============================================
// AGENT WATCH FOLDERS - Manage video watch locations
// ============================================

// POST - Add a watch folder
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId, path, name, recursive, filePatterns } = body;

    if (!deviceId || !path) {
      return NextResponse.json({ error: 'Device ID and path required' }, { status: 400 });
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Check if folder already exists for this device
    const existing = await requirePrisma().watchFolder.findFirst({
      where: { deviceId, path },
    });

    if (existing) {
      return NextResponse.json({ 
        success: true, 
        folder: existing,
        duplicate: true,
      });
    }

    const folder = await requirePrisma().watchFolder.create({
      data: {
        deviceId,
        path,
        name: name || path.split(/[/\\]/).pop() || 'Watch Folder',
        recursive: recursive || false,
        filePatterns: filePatterns || ['*.mp4', '*.mov', '*.avi', '*.mkv'],
      },
    });

    return NextResponse.json({ success: true, folder });

  } catch (error) {
    console.error('Failed to add watch folder:', error);
    return NextResponse.json({ error: 'Failed to add watch folder' }, { status: 500 });
  }
}

// DELETE - Remove a watch folder
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('id');

    if (!folderId) {
      return NextResponse.json({ error: 'Folder ID required' }, { status: 400 });
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    await requirePrisma().watchFolder.delete({
      where: { id: folderId },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Failed to delete watch folder:', error);
    return NextResponse.json({ error: 'Failed to delete watch folder' }, { status: 500 });
  }
}
