import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that do not require authentication
const PUBLIC_ROUTES = [
  "/login",
  "/verify",
  "/api/auth/request-otp",
  "/api/auth/verify-otp",
];

// Routes that authenticated users should not access (if already authenticated)
const AUTH_ROUTES = ["/login", "/verify"];

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const sessionCookie = request.cookies.get("univault_session");
  const isAuthenticated = Boolean(sessionCookie?.value);

  // If user explicitly asks to logout or clear session on login page
  if (pathname === "/login" && searchParams.get("logout") === "true") {
    const response = NextResponse.next();
    response.cookies.delete("univault_session");
    return response;
  }

  // The landing page ('/') is always public
  const isRoot = pathname === "/";
  const isPublic = isRoot || PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  const isApiRoute = pathname.startsWith("/api/");

  // If authenticated user tries to access login/verify, redirect to dashboard
  if (isAuthenticated && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If unauthenticated user tries to access a protected route, redirect to login
  if (!isAuthenticated && !isPublic && !isApiRoute) {
    const loginUrl = new URL("/login", request.url);
    if (!isRoot && pathname !== "/login") {
      loginUrl.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files, images, and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
