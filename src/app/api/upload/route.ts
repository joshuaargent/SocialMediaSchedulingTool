import { NextRequest, NextResponse } from 'next/server';
import { uploadFile, validateFile, getStorageProvider } from '@/lib/storage';
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

    // Build response
    const response: Record<string, unknown> = {
      success: true,
      file: {
        url,
        key,
        originalName: file.name,
        size: file.size,
        type: file.type,
      },
    };

    // Store metadata in database (if prisma is configured)
    if (prisma) {
      try {
        const mediaAsset = await prisma.mediaAsset.create({
          data: {
            organizationId: session.user.organizationId,
            filename: file.name,
            url: url,
            type: type,
            mimeType: file.type,
            size: file.size,
            // For Garage/R2/etc, store the key for deletion
            metadata: { storageKey: key },
          },
        });
        (response as { file?: { mediaAssetId?: string } }).file!.mediaAssetId = mediaAsset.id;
      } catch (dbError) {
        console.warn('Failed to create MediaAsset record:', dbError);
      }
    }

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Upload failed' 
    }, { status: 500 });
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

    // Get type filter from query params
    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get('type');

    const where = { organizationId: session.user.organizationId };
    if (typeFilter) {
      (where as Record<string, unknown>).type = typeFilter;
    }

    const assets = await prisma.mediaAsset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    // Get storage provider info
    const provider = getStorageProvider();
    const storageType = process.env.STORAGE_PROVIDER || 'local';

    return NextResponse.json({ 
      files: assets,
      storage: {
        provider: storageType,
        endpoint: process.env.GARAGE_ENDPOINT || process.env.R2_ACCOUNT_ID ? 'remote' : 'local',
      }
    });
  } catch (error) {
    console.error('List error:', error);
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
  }
}

// DELETE /api/upload - Delete a file
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');

    if (!fileUrl) {
      return NextResponse.json({ error: 'No file URL provided' }, { status: 400 });
    }

    // Delete from storage if we have a key
    if (prisma) {
      const asset = await prisma.mediaAsset.findFirst({
        where: {
          organizationId: session.user.organizationId,
          url: fileUrl,
        },
      });

      if (asset?.metadata && typeof asset.metadata === 'object') {
        const meta = asset.metadata as { storageKey?: string };
        if (meta.storageKey) {
          const { deleteFile } = await import('@/lib/storage');
          await deleteFile(meta.storageKey);
        }
      }

      // Delete database record
      await prisma.mediaAsset.deleteMany({
        where: {
          organizationId: session.user.organizationId,
          url: fileUrl,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}