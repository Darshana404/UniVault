import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that do not require authentication
const PUBLIC_ROUTES = ["/login", "/verify", "/api/auth/request-otp", "/api/auth/verify-otp"];

// Routes that authenticated users should not access
const AUTH_ROUTES = ["/login", "/verify"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("univault_session");
  const isAuthenticated = Boolean(sessionCookie?.value);

  // If authenticated user tries to access login/verify, redirect to dashboard
  if (isAuthenticated && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If unauthenticated user tries to access a protected route, redirect to login
  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  const isApiRoute = pathname.startsWith("/api/");

  if (!isAuthenticated && !isPublic && !isApiRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For protected API routes, let the route handler validate the session
  // (middleware only checks cookie existence; full validation happens server-side)
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};