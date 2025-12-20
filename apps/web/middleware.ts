import { NextResponse, NextRequest } from 'next/server';

// Decode the mock token. In this demo the token is of the form
// "mock.<base64json>" where the JSON contains email, role and exp (unix
// timestamp). This helper returns the decoded payload or null if the token
// cannot be parsed.
function decodeToken(token: string) {
  try {
    const [, payload] = token.split('.');
    const json = Buffer.from(payload, 'base64').toString('utf8');
    return JSON.parse(json) as { email: string; role: string; exp: number };
  } catch {
    return null;
  }
}

// Define role access matrix for top level /app routes. Nested routes inherit
// permissions from their parent. If a route is not present here it is
// considered public (e.g. /login). Adjust this table to change access.
const routeRoles: Record<string, string[] | undefined> = {
  '/app/admin': ['admin'],
  '/app/reports': ['admin', 'manager'],
  '/app/uploads': ['admin', 'manager', 'viewer'],
  '/app/errors': ['admin', 'manager', 'viewer'],
  '/app/perf': ['admin', 'manager', 'viewer'],
  '/app/profile': ['admin', 'manager', 'viewer']
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Only guard /app routes
  if (!pathname.startsWith('/app')) {
    return NextResponse.next();
  }
  // Retrieve token from cookie
  const token = request.cookies.get('token')?.value;
  if (!token) {
    // Redirect to login if not authenticated
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
  const payload = decodeToken(token);
  if (!payload) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
  // Check expiry
  if (payload.exp * 1000 < Date.now()) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
  // Determine required roles for the route
  for (const route in routeRoles) {
    if (pathname.startsWith(route)) {
      const allowed = routeRoles[route];
      if (allowed && !allowed.includes(payload.role)) {
        // Redirect to profile with a query parameter so the client can show a
        // toast. The page itself performs the toast mapping.
        const url = new URL('/app/profile', request.url);
        url.searchParams.set('noAccess', '1');
        return NextResponse.redirect(url);
      }
      break;
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*']
};