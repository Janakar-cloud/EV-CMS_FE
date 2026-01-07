import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { withSecurityHeaders } from '@/lib/security';

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/forgot-password', '/reset-password'];

// Define API routes that should be proxied
const apiRoutes = ['/api'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow API routes to pass through
  if (apiRoutes.some(route => pathname.startsWith(route))) {
    const response = NextResponse.next();
    return withSecurityHeaders(response);
  }

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Get the token from cookies
  const token = request.cookies.get('auth-token')?.value;

  // If accessing a protected route without a token, redirect to login
  if (!isPublicRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing a public route with a token, redirect to dashboard
  if (isPublicRoute && token && pathname !== '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Add security headers
  const response = NextResponse.next();
  
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
