import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma, isDatabaseConfigured } from '@/lib/db/prisma';

// GET /api/admin/organizations - List all organizations and their status
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId || !prisma) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow access to admin users (you could add role checking here)
    // For now, we'll check if user is admin or if you want to make it public
    
    const organizations = await prisma.organization.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { users: true, posts: true }
        }
      }
    });

    return NextResponse.json({ organizations });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 });
  }
}