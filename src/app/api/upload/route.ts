import { NextRequest, NextResponse } from 'next/server';
import { uploadFile, validateFile } from '@/lib/storage';
import { auth } from '@/auth';
import { prisma } from '@/lib/db/prisma';

// POST /api/upload - Upload a file
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file
    let type: 'image' | 'video' | 'document' = 'document';
    if (file.type.startsWith('image/')) type = 'image';
    else if (file.type.startsWith('video/')) type = 'video';

    const validation = validateFile(file, type);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Upload to storage
    const folder = `org-${session.user.organizationId}`;
    const { url, key } = await uploadFile(file, folder);

    // Store metadata in database (if prisma is configured)
    let mediaAsset = null;
    if (prisma) {
      try {
        mediaAsset = await prisma.mediaAsset.create({
          data: {
            organizationId: session.user.organizationId,
            filename: file.name,
            url: url,
            type: type,
            mimeType: file.type,
            size: file.size,
          },
        });
      } catch (dbError) {
        // File uploaded but database record failed - not critical
        console.warn('Failed to create MediaAsset record:', dbError);
      }
    }

    return NextResponse.json({
      success: true,
      file: {
        url,
        key,
        originalName: file.name,
        size: file.size,
        type: file.type,
        mediaAssetId: mediaAsset?.id,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

// GET /api/upload - List uploaded files
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!prisma) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const assets = await prisma.mediaAsset.findMany({
      where: { organizationId: session.user.organizationId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ files: assets });
  } catch (error) {
    console.error('List error:', error);
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
  }
}