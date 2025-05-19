import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  console.log(`[Middleware] START - Request to: ${request.nextUrl.pathname}`);
  
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
  console.log(`[Middleware] Request path: ${request.nextUrl.pathname}, User from getUser(): ${user ? user.email : 'null'}, Error: ${getUserError || 'none'}`);

  // If there's no session and the user is trying to access a protected route
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard')
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || 
                       request.nextUrl.pathname.startsWith('/signup')

  console.log(`[Middleware] Route type: ${isProtectedRoute ? 'Protected' : (isAuthRoute ? 'Auth' : 'Public')}`);

  if (!user && isProtectedRoute) {
    console.log(`[Middleware] Condition: !user && isProtectedRoute. User is null. Path: ${request.nextUrl.pathname}. Redirecting to /login`);
    const redirectUrl = new URL('/login', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If the user is authenticated and trying to access auth routes
  if (user && isAuthRoute) {
    console.log(`[Middleware] Condition: user && isAuthRoute. User: ${user.email}. Path: ${request.nextUrl.pathname}. Redirecting to /dashboard`);
    const redirectUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  console.log(`[Middleware] No redirect conditions met. Path: ${request.nextUrl.pathname}, User: ${user ? user.email : 'null'}. Proceeding.`);
  console.log(`[Middleware] END - Allowing access to: ${request.nextUrl.pathname}`);
  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/signup',
  ],
} 