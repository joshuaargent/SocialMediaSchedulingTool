import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const pathname = req.nextUrl.pathname

  // Public paths that don't require authentication
  const publicPaths = ["/", "/login", "/api/auth", "/pending"]
  const isPublic = publicPaths.some(p => pathname.startsWith(p))

  // Allow public paths
  if (isPublic) {
    return NextResponse.next()
  }

  // Check for static files and API routes that don't need auth
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Check approval status for protected routes
  const approved = req.auth?.user?.approved
  if (isLoggedIn && approved === false) {
    if (!pathname.startsWith("/pending")) {
      return NextResponse.redirect(new URL("/pending", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
}