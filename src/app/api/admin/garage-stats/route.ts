import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

// Admin email whitelist - only these emails can access admin features
const ADMIN_EMAILS = ['argentjackjoshua@outlook.com'];

// ============================================
// GARAGE STATISTICS API
// ============================================
// Provides detailed statistics about Garage storage
// Only accessible by the admin user

interface GarageStats {
  server: {
    version: string;
    uptime: number;
    status: 'online' | 'offline' | 'unknown';
  };
  storage: {
    provider: string;
    endpoint: string;
    bucket: string;
    capacity: {
      total: number;
      used: number;
      free: number;
      usedPercent: number;
    };
  };
  network: {
    latency: number | null;
    connected: boolean;
  };
  files: {
    total: number;
    images: number;
    videos: number;
    documents: number;
    totalSize: number;
  };
  security: {
    localNetworkOnly: boolean;
    authenticationRequired: boolean;
    credentialsConfigured: boolean;
  };
  lastUpdated: string;
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
    
    if (storageProvider !== 'garage') {
      return NextResponse.json({ 
        error: 'Not using Garage storage',
        provider: storageProvider,
      }, { status: 400 });
    }

    const stats = await getGarageStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Garage stats error:', error);
    return NextResponse.json({ 
      error: 'Failed to get Garage statistics',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

async function getGarageStats(): Promise<GarageStats> {
  const endpoint = process.env.GARAGE_ENDPOINT || '';
  const accessKey = process.env.GARAGE_ACCESS_KEY || '';
  const secretKey = process.env.GARAGE_SECRET_KEY || '';
  const bucket = process.env.GARAGE_BUCKET || 'videos';
  const startTime = Date.now();

  // Check if Garage is reachable
  let latency: number | null = null;
  let connected = false;

  try {
    const response = await fetch(`${endpoint}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/xml',
      },
    });

    latency = Date.now() - startTime;
    connected = response.ok || [400, 403, 404].includes(response.status);
  } catch {
    latency = Date.now() - startTime;
    connected = false;
  }

  // Get media statistics from database
  let fileStats = {
    total: 0,
    images: 0,
    videos: 0,
    documents: 0,
    totalSize: 0,
  };

  try {
    const { prisma } = await import('@/lib/db/prisma');
    if (prisma) {
      const assets = await prisma.mediaAsset.findMany({
        select: {
          type: true,
          size: true,
        },
      });

      fileStats = {
        total: assets.length,
        images: assets.filter(a => a.type === 'image').length,
        videos: assets.filter(a => a.type === 'video').length,
        documents: assets.filter(a => a.type === 'document').length,
        totalSize: assets.reduce((sum, a) => sum + (a.size || 0), 0),
      };
    }
  } catch (e) {
    console.warn('Could not fetch media assets:', e);
  }

  // Estimate storage capacity
  // Default to 256GB SD card - can be configured via environment variable
  const totalCapacityGB = parseInt(process.env.GARAGE_STORAGE_CAPACITY_GB || '256');
  const usedBytes = fileStats.totalSize;
  
  return {
    server: {
      version: 'Garage v1.1.0+',
      uptime: Date.now(), // Would need server-side tracking for real uptime
      status: connected ? 'online' : 'offline',
    },
    storage: {
      provider: 'garage',
      endpoint,
      bucket,
      capacity: {
        total: totalCapacityGB * 1024 * 1024 * 1024,
        used: usedBytes,
        free: (totalCapacityGB * 1024 * 1024 * 1024) - usedBytes,
        usedPercent: usedBytes > 0 ? Math.round((usedBytes / (totalCapacityGB * 1024 * 1024 * 1024)) * 100) : 0,
      },
    },
    network: {
      latency,
      connected,
    },
    files: fileStats,
    security: {
      localNetworkOnly: true,
      authenticationRequired: true,
      credentialsConfigured: !!(accessKey && secretKey),
    },
    lastUpdated: new Date().toISOString(),
  };
}