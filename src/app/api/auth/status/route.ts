import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ 
      authenticated: false,
      approved: false 
    });
  }
  
  return NextResponse.json({
    authenticated: true,
    approved: session.user.approved ?? false,
    email: session.user.email,
    organizationId: session.user.organizationId,
  });
}