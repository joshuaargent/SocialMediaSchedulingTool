import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

// Admin email whitelist - only these emails can access admin features
const ADMIN_EMAILS = ['argentjackjoshua@outlook.com'];

// ============================================
// STORAGE HEALTH CHECK
// ============================================
// This endpoint provides storage health information
// Only accessible by the admin user

interface StorageHealth {
  provider: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  endpoint: string;
  connected: boolean;
  latency: number | null;
  error?: string;
  capacity?: {
    total: number;
    used: number;
    free: number;
    usedPercent: number;
  };
  lastChecked: string;
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (!ADMIN_EMAILS.includes(session.user.email.toLowerCase())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const storageProvider = process.env.STORAGE_PROVIDER || 'local';
    const startTime = Date.now();

    let health: StorageHealth = {
      provider: storageProvider,
      status: 'unknown',
      endpoint: '',
      connected: false,
      latency: null,
      lastChecked: new Date().toISOString(),
    };

    switch (storageProvider) {
      case 'garage':
        health = await checkGarageHealth(startTime);
        break;
      case 'r2':
        health = await checkR2Health(startTime);
        break;
      case 'b2':
        health = await checkB2Health(startTime);
        break;
      case 'supabase':
        health = await checkSupabaseHealth(startTime);
        break;
      default:
        health = {
          ...health,
          status: 'unknown',
          endpoint: 'local',
          error: 'Local storage - health check not applicable',
        };
    }

    return NextResponse.json({ health });
  } catch (error) {
    console.error('Storage health check error:', error);
    return NextResponse.json({ 
      error: 'Failed to check storage health',
      health: {
        provider: process.env.STORAGE_PROVIDER || 'unknown',
        status: 'error',
        endpoint: '',
        connected: false,
        latency: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        lastChecked: new Date().toISOString(),
      }
    }, { status: 500 });
  }
}

// ============================================
// GARAGE HEALTH CHECK
// ============================================

async function checkGarageHealth(startTime: number): Promise<StorageHealth> {
  const endpoint = process.env.GARAGE_ENDPOINT || '';
  const accessKey = process.env.GARAGE_ACCESS_KEY || '';

  if (!endpoint || !accessKey) {
    return {
      provider: 'garage',
      status: 'error',
      endpoint,
      connected: false,
      latency: null,
      error: 'Garage not configured',
      lastChecked: new Date().toISOString(),
    };
  }

  try {
    // Test connection with S3-style request
    const response = await fetch(`${endpoint}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/xml',
      },
    });

    const latency = Date.now() - startTime;

    // Garage returns various error codes, but if we get a response, it's running
    if (response.ok || response.status === 400 || response.status === 403 || response.status === 404) {
      const capacity = estimateStorageCapacity();

      return {
        provider: 'garage',
        status: 'healthy',
        endpoint,
        connected: true,
        latency,
        capacity,
        lastChecked: new Date().toISOString(),
      };
    }

    return {
      provider: 'garage',
      status: 'error',
      endpoint,
      connected: false,
      latency,
      error: `Unexpected response: ${response.status}`,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      provider: 'garage',
      status: 'error',
      endpoint,
      connected: false,
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Connection failed',
      lastChecked: new Date().toISOString(),
    };
  }
}

// ============================================
// R2 HEALTH CHECK
// ============================================

async function checkR2Health(startTime: number): Promise<StorageHealth> {
  const accountId = process.env.R2_ACCOUNT_ID || '';
  
  if (!accountId) {
    return {
      provider: 'r2',
      status: 'error',
      endpoint: 'Cloudflare R2',
      connected: false,
      latency: null,
      error: 'R2 not configured',
      lastChecked: new Date().toISOString(),
    };
  }

  try {
    const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
    
    const response = await fetch(`${endpoint}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/xml',
      },
    });

    const latency = Date.now() - startTime;

    if (response.status === 403 || response.ok) {
      return {
        provider: 'r2',
        status: 'healthy',
        endpoint,
        connected: true,
        latency,
        lastChecked: new Date().toISOString(),
      };
    }

    return {
      provider: 'r2',
      status: 'error',
      endpoint,
      connected: false,
      latency,
      error: `Unexpected status: ${response.status}`,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      provider: 'r2',
      status: 'error',
      endpoint: 'Cloudflare R2',
      connected: false,
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Connection failed',
      lastChecked: new Date().toISOString(),
    };
  }
}

// ============================================
// BACKBLAZE B2 HEALTH CHECK
// ============================================

async function checkB2Health(startTime: number): Promise<StorageHealth> {
  const accountId = process.env.B2_ACCOUNT_ID || '';
  const appKey = process.env.B2_APPLICATION_KEY || '';
  
  if (!accountId || !appKey) {
    return {
      provider: 'b2',
      status: 'error',
      endpoint: 'Backblaze B2',
      connected: false,
      latency: null,
      error: 'B2 not configured',
      lastChecked: new Date().toISOString(),
    };
  }

  try {
    const authResponse = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${accountId}:${appKey}`).toString('base64'),
      },
    });

    const latency = Date.now() - startTime;

    if (authResponse.ok) {
      const data = await authResponse.json();
      return {
        provider: 'b2',
        status: 'healthy',
        endpoint: data.apiUrl,
        connected: true,
        latency,
        lastChecked: new Date().toISOString(),
      };
    }

    return {
      provider: 'b2',
      status: 'error',
      endpoint: 'Backblaze B2',
      connected: false,
      latency,
      error: `Auth failed: ${authResponse.status}`,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      provider: 'b2',
      status: 'error',
      endpoint: 'Backblaze B2',
      connected: false,
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Connection failed',
      lastChecked: new Date().toISOString(),
    };
  }
}

// ============================================
// SUPABASE HEALTH CHECK
// ============================================

async function checkSupabaseHealth(startTime: number): Promise<StorageHealth> {
  const storageUrl = process.env.SUPABASE_STORAGE_URL || '';
  
  if (!storageUrl) {
    return {
      provider: 'supabase',
      status: 'error',
      endpoint: 'Supabase Storage',
      connected: false,
      latency: null,
      error: 'Supabase not configured',
      lastChecked: new Date().toISOString(),
    };
  }

  try {
    const response = await fetch(`${storageUrl}/storage/v1/health`, {
      headers: {
        'apikey': process.env.SUPABASE_STORAGE_KEY || '',
      },
    });

    const latency = Date.now() - startTime;

    if (response.ok) {
      return {
        provider: 'supabase',
        status: 'healthy',
        endpoint: storageUrl,
        connected: true,
        latency,
        lastChecked: new Date().toISOString(),
      };
    }

    return {
      provider: 'supabase',
      status: 'warning',
      endpoint: storageUrl,
      connected: response.status !== 401,
      latency,
      error: `Status: ${response.status}`,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      provider: 'supabase',
      status: 'error',
      endpoint: 'Supabase Storage',
      connected: false,
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Connection failed',
      lastChecked: new Date().toISOString(),
    };
  }
}

// ============================================
// HELPERS
// ============================================

function estimateStorageCapacity() {
  // Default to 256GB SD card - update based on user's actual size
  const totalGB = parseInt(process.env.GARAGE_STORAGE_CAPACITY_GB || '256');
  const usedGB = 0;
  
  return {
    total: totalGB * 1024 * 1024 * 1024,
    used: usedGB * 1024 * 1024 * 1024,
    free: (totalGB - usedGB) * 1024 * 1024 * 1024,
    usedPercent: 0,
  };
}