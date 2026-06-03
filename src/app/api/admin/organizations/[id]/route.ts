import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma, isDatabaseConfigured } from '@/lib/db/prisma';

// PATCH /api/admin/organizations/[id] - Update organization (approve/reject)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId || !prisma) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { approved, name } = body;

    // Update organization
    const organization = await prisma.organization.update({
      where: { id },
      data: {
        ...(approved !== undefined && { approved }),
        ...(name !== undefined && { name }),
      },
      include: {
        users: {
          select: { id: true, email: true, name: true }
        }
      }
    });

    return NextResponse.json({ organization });
  } catch (error) {
    console.error('Error updating organization:', error);
    return NextResponse.json({ error: 'Failed to update organization' }, { status: 500 });
  }
}