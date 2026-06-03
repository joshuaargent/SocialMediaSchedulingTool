import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }
  } catch (error) {
    console.warn('Upload directory creation failed:', error);
  }
}

// Validate file size based on environment
function getMaxSize(): number {
  // Vercel has a 4.5MB default for serverless functions
  // For Edge runtime, it's even smaller (0.5MB)
  // For Node.js runtime, we can go up to 4.5MB in theory, but typically 4.5MB is the limit
  const maxSize = 4.5 * 1024 * 1024; // 4.5MB for Vercel serverless
  return maxSize;
}

// POST /api/upload - Upload a file
export async function POST(request: NextRequest) {
  try {
    await ensureUploadDir();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Validate file size
    const maxSize = getMaxSize();
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `File too large (max ${Math.round(maxSize / 1024 / 1024)}MB for serverless upload)`,
        maxSize: maxSize,
      }, { status: 400 });
    }

    // Generate unique filename
    const ext = path.extname(file.name);
    const filename = `${randomUUID()}${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    // Write file
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filepath, buffer);
    } catch (fsError) {
      console.error('File system write error:', fsError);
      // If file system write fails (common on Vercel), store in memory and return URL
      // For production, use Vercel Blob or S3
      return NextResponse.json({ 
        error: 'File storage not available in this environment. Use Vercel Blob or external storage.',
        message: 'Upload endpoint requires persistent file storage. Configure Vercel Blob or S3 for production.',
      }, { status: 503 });
    }

    // Generate URL (for local development)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const url = `${baseUrl}/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      file: {
        filename,
        originalName: file.name,
        url,
        size: file.size,
        type: file.type,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

// GET /api/upload - List uploaded files
export async function GET() {
  try {
    await ensureUploadDir();
    const { readdir } = await import('fs/promises');
    
    const files = await readdir(UPLOAD_DIR);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    const fileList = files.map((filename) => ({
      filename,
      url: `${baseUrl}/uploads/${filename}`,
    }));

    return NextResponse.json({ files: fileList });
  } catch (error) {
    console.error('List error:', error);
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
  }
}