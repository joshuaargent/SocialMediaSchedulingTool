/**
 * Storage Service
 * Supports multiple providers: Cloudflare R2, Supabase Storage, Backblaze B2, or local filesystem
 * 
 * HOW IT WORKS:
 * 1. When a user uploads a file, the API receives it
 * 2. This service uploads it to your chosen storage provider
 * 3. Returns a public URL that can be stored in the database
 * 4. No local filesystem needed - everything is in the cloud
 */

// ============================================
// STORAGE PROVIDER INTERFACE
// ============================================

interface StorageProvider {
  upload(file: File, path: string): Promise<{ url: string; key: string }>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
}

// ============================================
// CLOUDFLARE R2 (S3 Compatible - 5GB Free)
// ============================================

class R2Storage implements StorageProvider {
  private accountId: string;
  private accessKeyId: string;
  private secretAccessKey: string;
  private bucketName: string;

  constructor() {
    this.accountId = process.env.R2_ACCOUNT_ID || '';
    this.accessKeyId = process.env.R2_ACCESS_KEY_ID || '';
    this.secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '';
    this.bucketName = process.env.R2_BUCKET_NAME || 'social-media-assets';
  }

  async upload(file: File, path: string): Promise<{ url: string; key: string }> {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    
    const client = new S3Client({
      region: 'auto',
      endpoint: `https://${this.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
      },
    });

    const key = `${path}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    const buffer = Buffer.from(await file.arrayBuffer());
    
    await client.send(new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    }));

    // R2 uses a custom domain or public URL
    const url = `https://pub-${this.accountId}.r2.dev/${key}`;
    
    return { url, key };
  }

  async delete(key: string): Promise<void> {
    const { S3Client, DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    
    const client = new S3Client({
      region: 'auto',
      endpoint: `https://${this.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
      },
    });

    await client.send(new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    }));
  }

  getUrl(key: string): string {
    return `https://pub-${this.accountId}.r2.dev/${key}`;
  }
}

// ============================================
// SUPABASE STORAGE (Free with Supabase DB)
// ============================================

class SupabaseStorage implements StorageProvider {
  private url: string;
  private key: string;

  constructor() {
    this.url = process.env.SUPABASE_STORAGE_URL || '';
    this.key = process.env.SUPABASE_STORAGE_KEY || '';
  }

  async upload(file: File, path: string): Promise<{ url: string; key: string }> {
    const filename = `${path}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    const buffer = Buffer.from(await file.arrayBuffer());
    
    const response = await fetch(`${this.url}/storage/v1/object/${filename}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.key}`,
        'Content-Type': file.type,
        'x-upsert': 'true',
      },
      body: buffer,
    });

    if (!response.ok) {
      throw new Error(`Supabase upload failed: ${response.statusText}`);
    }

    const url = `${this.url}/storage/v1/object/public/${filename}`;
    return { url, key: filename };
  }

  async delete(key: string): Promise<void> {
    await fetch(`${this.url}/storage/v1/object/${key}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.key}`,
      },
    });
  }

  getUrl(key: string): string {
    return `${this.url}/storage/v1/object/public/${key}`;
  }
}

// ============================================
// BACKBLAZE B2 ($0.01/GB - Very Cheap)
// ============================================

class B2Storage implements StorageProvider {
  private accountId: string;
  private applicationKey: string;
  private bucketName: string;
  private uploadUrl: string | null = null;
  private uploadAuthToken: string | null = null;

  constructor() {
    this.accountId = process.env.B2_ACCOUNT_ID || '';
    this.applicationKey = process.env.B2_APPLICATION_KEY || '';
    this.bucketName = process.env.B2_BUCKET_NAME || '';
  }

  private async getUploadUrl(): Promise<{ url: string; authToken: string }> {
    if (this.uploadUrl && this.uploadAuthToken) {
      return { url: this.uploadUrl, authToken: this.uploadAuthToken };
    }

    // Get authorization
    const authResponse = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${this.accountId}:${this.applicationKey}`).toString('base64'),
      },
    });

    const authData = await authResponse.json();
    
    // Get upload URL
    const urlResponse = await fetch(`${authData.apiUrl}/b2api/v2/b2_get_upload_url`, {
      method: 'POST',
      headers: {
        'Authorization': authData.authorizationToken,
      },
      body: JSON.stringify({ bucketId: this.bucketName }),
    });

    const urlData = await urlResponse.json();
    
    this.uploadUrl = urlData.uploadUrl;
    this.uploadAuthToken = urlData.authorizationToken;

    return { url: this.uploadUrl as string, authToken: this.uploadAuthToken as string };
  }

  async upload(file: File, path: string): Promise<{ url: string; key: string }> {
    const { url, authToken } = await this.getUploadUrl();
    
    const filename = `${path}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authToken,
        'Content-Type': file.type,
        'X-Bz-File-Name': filename,
        'X-Bz-Info-Author': 'social-media-tool',
      },
      body: buffer,
    });

    if (!response.ok) {
      throw new Error(`B2 upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    const publicUrl = `https://f${result.recommendedPartSize}.backblazeb2.com/${this.bucketName}/${filename}`;
    
    return { url: publicUrl, key: filename };
  }

  async delete(key: string): Promise<void> {
    // B2 delete requires more setup - simplified for now
    console.log('B2 delete not implemented - would need file ID');
  }

  getUrl(key: string): string {
    return `https://f000.backblazeb2.com/${this.bucketName}/${key}`;
  }
}

// ============================================
// LOCAL FILESYSTEM (Development Only)
// ============================================

class LocalStorage implements StorageProvider {
  private basePath: string;

  constructor() {
    this.basePath = process.env.LOCAL_STORAGE_PATH || './uploads';
  }

  async upload(file: File, path: string): Promise<{ url: string; key: string }> {
    const { writeFile, mkdir } = await import('fs/promises');
    const { existsSync } = await import('fs');
    const { randomUUID } = await import('crypto');
    
    const dir = `${this.basePath}/${path}`;
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
    
    const ext = file.name.split('.').pop() || '';
    const filename = `${randomUUID()}.${ext}`;
    const key = `${path}/${filename}`;
    const filepath = `${dir}/${filename}`;
    
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const url = `${baseUrl}/uploads/${key}`;
    
    return { url, key };
  }

  async delete(key: string): Promise<void> {
    const { unlink } = await import('fs/promises');
    await unlink(`${this.basePath}/${key}`);
  }

  getUrl(key: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    return `${baseUrl}/uploads/${key}`;
  }
}

// ============================================
// GARAGE (Self-hosted S3 on Android Tablet + SD Card)
// ============================================

/**
 * Garage is a self-hosted, S3-compatible object storage server.
 * Perfect for running on Android tablets with SD cards!
 * 
 * Setup Guide:
 * 1. Install Termux on your Android tablet
 * 2. Download Garage: https://garagehq.deuxfleurs.fr/
 * 3. Configure and run on your SD card
 * 4. Set STORAGE_PROVIDER=garage in your .env.local
 */
class GarageStorage implements StorageProvider {
  private endpoint: string;
  private accessKeyId: string;
  private secretAccessKey: string;
  private bucketName: string;

  constructor() {
    this.endpoint = process.env.GARAGE_ENDPOINT || 'http://localhost:3900';
    this.accessKeyId = process.env.GARAGE_ACCESS_KEY || '';
    this.secretAccessKey = process.env.GARAGE_SECRET_KEY || '';
    this.bucketName = process.env.GARAGE_BUCKET || 'videos-bucket';
  }

  async upload(file: File, path: string): Promise<{ url: string; key: string }> {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    
    const client = new S3Client({
      region: 'garage',
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
      },
      forcePathStyle: true, // Required for Garage (and MinIO)
    });

    const key = `${path}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    
    await client.send(new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    }));

    // Construct URL - use the endpoint directly for local access
    // Or configure a public domain for remote access
    const baseUrl = process.env.GARAGE_PUBLIC_URL || this.endpoint;
    const url = `${baseUrl}/${this.bucketName}/${key}`;
    
    return { url, key };
  }

  async delete(key: string): Promise<void> {
    const { S3Client, DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    
    const client = new S3Client({
      region: 'garage',
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
      },
      forcePathStyle: true,
    });

    await client.send(new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    }));
  }

  getUrl(key: string): string {
    const baseUrl = process.env.GARAGE_PUBLIC_URL || this.endpoint;
    return `${baseUrl}/${this.bucketName}/${key}`;
  }
}

// ============================================
// STORAGE FACTORY
// ============================================

let storageProvider: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (storageProvider) return storageProvider;

  const provider = process.env.STORAGE_PROVIDER || 'local';
  
  switch (provider) {
    case 'r2':
      if (!process.env.R2_ACCOUNT_ID) {
        console.warn('R2 not configured, falling back to local storage');
        return new LocalStorage();
      }
      storageProvider = new R2Storage();
      break;
    case 'supabase':
      if (!process.env.SUPABASE_STORAGE_URL) {
        console.warn('Supabase Storage not configured, falling back to local storage');
        return new LocalStorage();
      }
      storageProvider = new SupabaseStorage();
      break;
    case 'b2':
      if (!process.env.B2_ACCOUNT_ID) {
        console.warn('Backblaze B2 not configured, falling back to local storage');
        return new LocalStorage();
      }
      storageProvider = new B2Storage();
      break;
    case 'garage':
      if (!process.env.GARAGE_ENDPOINT) {
        console.warn('Garage not configured, falling back to local storage');
        return new LocalStorage();
      }
      storageProvider = new GarageStorage();
      break;
    default:
      storageProvider = new LocalStorage();
  }

  return storageProvider;
}

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

export async function uploadFile(file: File, folder: string = 'uploads'): Promise<{ url: string; key: string }> {
  const provider = getStorageProvider();
  return provider.upload(file, folder);
}

export async function deleteFile(key: string): Promise<void> {
  const provider = getStorageProvider();
  return provider.delete(key);
}

export function getFileUrl(key: string): string {
  const provider = getStorageProvider();
  return provider.getUrl(key);
}

// Supported file types
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-msvideo',
  'application/pdf',
];

// Max file sizes (in bytes)
export const MAX_FILE_SIZES = {
  image: 10 * 1024 * 1024,      // 10MB for images
  video: 500 * 1024 * 1024,    // 500MB for videos (adjust based on platform limits)
  document: 10 * 1024 * 1024, // 10MB for documents
};

export function validateFile(file: File, type: 'image' | 'video' | 'document'): { valid: boolean; error?: string } {
  // Check file type
  const allowed = ALLOWED_FILE_TYPES;
  if (!allowed.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} not supported` };
  }

  // Check file size based on type
  let maxSize: number;
  if (file.type.startsWith('image/')) maxSize = MAX_FILE_SIZES.image;
  else if (file.type.startsWith('video/')) maxSize = MAX_FILE_SIZES.video;
  else maxSize = MAX_FILE_SIZES.document;

  if (file.size > maxSize) {
    const maxMB = Math.round(maxSize / 1024 / 1024);
    return { valid: false, error: `File too large (max ${maxMB}MB)` };
  }

  return { valid: true };
}