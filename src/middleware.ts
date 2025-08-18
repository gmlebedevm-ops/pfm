import { NextResponse } from "next/server";
import type { NextRequest } from "next/request";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login page and API routes
  if (pathname === "/login" || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // For all other routes, check if user is authenticated
  // Since we're using NextAuth, the session cookie will be handled automatically
  // We'll let the client-side handle authentication checks
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};