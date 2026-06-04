import { NextRequest, NextResponse } from 'next/server';
import { isDatabaseConfigured, requirePrisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

// GET - Fetch pipeline (content projects) for organization
export async function GET(request: NextRequest) {
  try {
    const orgId = request.cookies.get('current_org_id')?.value;

    // If not logged in, return empty array (not 401)
    if (!orgId) {
      return NextResponse.json({ projects: [], message: 'Not logged in - using local data' });
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ projects: [], error: 'Database not configured' }, { status: 500 });
    }

    const projects = await requirePrisma().contentProject.findMany({
      where: { organizationId: orgId },
      include: {
        series: true,
        milestones: {
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { ideaDate: 'desc' },
    });

    return NextResponse.json({ projects });

  } catch (error) {
    console.error('Failed to fetch pipeline:', error);
    return NextResponse.json({ projects: [], error: 'Failed to fetch pipeline' }, { status: 500 });
  }
}

// POST - Create a new pipeline item (content project) - requires auth
export async function POST(request: NextRequest) {
  try {
    const orgId = request.cookies.get('current_org_id')?.value;
    const userId = request.cookies.get('current_user_id')?.value;

    if (!orgId) {
      return NextResponse.json({ error: 'Please log in to create pipeline items' }, { status: 401 });
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { title, description, seriesId, status, productionStage, thumbnailUrl, ideaDate, scriptDeadline, filmedDate, editedDate, reviewDate, notes } = body;

    const project = await requirePrisma().contentProject.create({
      data: {
        organizationId: orgId,
        userId: userId || 'unknown',
        title: title || 'Untitled',
        description,
        seriesId,
        status: status || 'idea',
        productionStage: productionStage || 'idea',
        thumbnailUrl,
        ideaDate: ideaDate ? new Date(ideaDate) : null,
        scriptDeadline: scriptDeadline ? new Date(scriptDeadline) : null,
        filmedDate: filmedDate ? new Date(filmedDate) : null,
        editedDate: editedDate ? new Date(editedDate) : null,
        reviewDate: reviewDate ? new Date(reviewDate) : null,
        notes,
      },
    });

    return NextResponse.json({ success: true, project });

  } catch (error) {
    console.error('Failed to create pipeline item:', error);
    return NextResponse.json({ error: 'Failed to create pipeline item' }, { status: 500 });
  }
}

// PATCH - Update pipeline item (move between stages) - requires auth
export async function PATCH(request: NextRequest) {
  try {
    const orgId = request.cookies.get('current_org_id')?.value;

    if (!orgId) {
      return NextResponse.json({ error: 'Please log in to update pipeline items' }, { status: 401 });
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { id, status, productionStage, title, description, notes, filmedDate, editedDate, reviewDate } = body;

    const project = await requirePrisma().contentProject.update({
      where: { id },
      data: {
        status,
        productionStage,
        title,
        description,
        notes,
        filmedDate: filmedDate ? new Date(filmedDate) : null,
        editedDate: editedDate ? new Date(editedDate) : null,
        reviewDate: reviewDate ? new Date(reviewDate) : null,
      },
    });

    return NextResponse.json({ success: true, project });

  } catch (error) {
    console.error('Failed to update pipeline item:', error);
    return NextResponse.json({ error: 'Failed to update pipeline item' }, { status: 500 });
  }
}

// DELETE - Delete pipeline item - requires auth
export async function DELETE(request: NextRequest) {
  try {
    const orgId = request.cookies.get('current_org_id')?.value;
    const projectId = request.nextUrl.searchParams.get('id');

    if (!orgId) {
      return NextResponse.json({ error: 'Please log in to delete pipeline items' }, { status: 401 });
    }

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    await requirePrisma().contentProject.delete({
      where: { id: projectId },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Failed to delete pipeline item:', error);
    return NextResponse.json({ error: 'Failed to delete pipeline item' }, { status: 500 });
  }
}
