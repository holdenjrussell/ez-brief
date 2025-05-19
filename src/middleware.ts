import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  console.log(`[Middleware] START - Request to: ${request.nextUrl.pathname}`);
  
  // Skip middleware for static resources
  if (
    request.nextUrl.pathname.includes('/_next/') ||
    request.nextUrl.pathname.includes('/api/') ||
    request.nextUrl.pathname.includes('/static/')
  ) {
    console.log(`[Middleware] Skipping for static resource: ${request.nextUrl.pathname}`);
    return NextResponse.next();
  }
  
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // Log cookies for debugging
  console.log(`[Middleware] Cookies received: ${request.cookies.getAll().map(c => c.name).join(', ') || 'none'}`);
  
  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          const cookie = request.cookies.get(name)?.value;
          console.log(`[Middleware] Reading cookie: ${name}, exists: ${!!cookie}`);
          return cookie;
        },
        set(name: string, value: string, options: CookieOptions) {
          // If the cookie is set, update the response
          // This will refresh the session if expired
          console.log(`[Middleware] Setting cookie: ${name}`);
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          // If the cookie is removed, update the response
          console.log(`[Middleware] Removing cookie: ${name}`);
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Get the user. This will refresh the session if expired.
  console.log(`[Middleware] Attempting to get user...`);
  const { data: { user }, error: getUserError } = await supabase.auth.getUser()
  
  // Also get the session directly
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  console.log(`[Middleware] User authentication status:`, {
    path: request.nextUrl.pathname,
    hasUser: !!user,
    userEmail: user?.email || 'none',
    hasSession: !!session,
    getUserError: getUserError?.message || 'none',
    sessionError: sessionError?.message || 'none',
  });

  // Check if there's a querystring that would indicate we're already in a redirect
  const hasRedirectParam = request.nextUrl.searchParams.has('t') || 
                         request.nextUrl.searchParams.has('from');
                         
  // If there's no session and the user is trying to access a protected route
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') || 
                          request.nextUrl.pathname.startsWith('/brands');
                          
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/signup');

  console.log(`[Middleware] Route type: ${isProtectedRoute ? 'Protected' : (isAuthRoute ? 'Auth' : 'Public')}`);
  console.log(`[Middleware] Has redirect params: ${hasRedirectParam}`);

  // Only perform redirects if we're not already in a redirect loop
  if (!hasRedirectParam) {
    if (!user && isProtectedRoute) {
      console.log(`[Middleware] No authenticated user for protected route: ${request.nextUrl.pathname}. Redirecting to /login`);
      // Always include a cache-busting query parameter
      const redirectUrl = new URL(`/login?from=${encodeURIComponent(request.nextUrl.pathname)}&t=${Date.now()}`, request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // If the user is authenticated and trying to access auth routes
    if (user && isAuthRoute) {
      console.log(`[Middleware] Authenticated user (${user.email}) accessing auth route: ${request.nextUrl.pathname}. Redirecting to /dashboard`);
      // Add a timestamp to prevent caching issues
      const redirectUrl = new URL(`/dashboard?t=${Date.now()}`, request.url);
      return NextResponse.redirect(redirectUrl);
    }
  } else {
    console.log(`[Middleware] Skipping redirect checks due to existing redirect parameters`);
  }

  console.log(`[Middleware] No redirect conditions met. Path: ${request.nextUrl.pathname}, User: ${user ? user.email : 'null'}. Proceeding.`);
  console.log(`[Middleware] END - Allowing access to: ${request.nextUrl.pathname}`);
  
  // Add cache control headers to prevent caching of authenticated responses
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 