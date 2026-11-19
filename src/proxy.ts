import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Validates and sanitizes internal redirect URLs.
 * Rejects protocol-relative URLs (//), external URLs, backslash tricks, and malformed inputs.
 */
function sanitizeRedirect(target: string | null | undefined, fallback: string = '/'): string {
  if (!target) return fallback;
  const trimmed = target.trim();

  // Must begin with a single '/' and not with '//' or contain backslashes
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('\\')) {
    return fallback;
  }

  try {
    const dummyOrigin = 'http://localhost';
    const parsed = new URL(trimmed, dummyOrigin);
    // Must remain within the dummy origin
    if (parsed.origin !== dummyOrigin) {
      return fallback;
    }
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return fallback;
  }
}

/**
 * Next.js 16 Proxy handler.
 * Runs on the Node.js runtime and provides centralized Supabase session refresh
 * and server-side route protection.
 */
export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Authenticate user via Supabase server-side validation (never use getSession for security)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;

  // Helper to attach Supabase refreshed cookies to any redirect response
  const createRedirect = (url: URL) => {
    const redirectRes = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => {
      redirectRes.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectRes;
  };

  // Route classifications
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isWelcomePage = pathname === '/welcome';
  const isTermsPage = pathname === '/terms';
  const isAuthCallback = pathname.startsWith('/auth/callback');
  const isPublicProfileView = pathname.startsWith('/profile/') && pathname.length > 9;
  const isApiRoute = pathname.startsWith('/api/');

  // If user is ALREADY authenticated and visits /login or /signup, redirect to /
  if (user && isAuthPage) {
    const redirectTarget = sanitizeRedirect(request.nextUrl.searchParams.get('redirectTo'), '/');
    return createRedirect(new URL(redirectTarget, request.url));
  }

  // Public pages accessible to anyone (unauthenticated or authenticated)
  const isPublicPage = isAuthPage || isWelcomePage || isTermsPage || isAuthCallback || isPublicProfileView || isApiRoute;

  // If the user is NOT authenticated and attempts to access any protected or admin route
  if (!user && !isPublicPage) {
    const fullPath = pathname + (search ? search : '');
    const loginUrl = new URL('/login', request.url);
    // Don't set redirectTo if visiting root / to keep URL clean
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirectTo', fullPath);
    }
    return createRedirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest)
     * - sw.js (service worker)
     * - static image formats (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

