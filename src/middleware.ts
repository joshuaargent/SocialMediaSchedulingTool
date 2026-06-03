import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/auth';

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/calendar', '/queue', '/analytics', '/settings', '/media-library', '/pipeline', '/production-calendar', '/series', '/seo', '/trends', '/bio', '/contact'];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/pending'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get session
  const session = await auth();
  
  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  
  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !session?.user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Redirect authenticated users away from auth routes (already logged in)
  if (isAuthRoute && session?.user) {
    // If user is authenticated but not approved, redirect to pending
    if (session.user.approved === false) {
      return NextResponse.redirect(new URL('/pending', request.url));
    }
    // If approved, go to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // For pending page, redirect to dashboard if approved
  if (pathname === '/pending' && session?.user?.approved === true) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Redirect root to dashboard if authenticated, otherwise to login
  if (pathname === '/') {
    if (session?.user?.approved) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else if (session?.user) {
      return NextResponse.redirect(new URL('/pending', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};