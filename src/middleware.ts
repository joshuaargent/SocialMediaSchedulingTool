import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/calendar', '/queue', '/analytics', '/settings', '/media-library', '/pipeline', '/production-calendar', '/series', '/seo', '/trends', '/bio', '/contact', '/admin'];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/pending'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  
  // Get session cookie
  const sessionToken = request.cookies.get('authjs.session-token')?.value 
    || request.cookies.get('__Secure-authjs.session-token')?.value
    || request.cookies.get('next-auth.session-token')?.value;
  
  // For protected routes, check if user has session
  if (isProtectedRoute && !sessionToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // If user has session and is on auth route, we can't redirect here 
  // because we can't verify the session in edge runtime
  // Let the client-side handle this instead
  
  // Redirect root to login (safe for edge)
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
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