import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { ENV } from './constants/environment'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
  })

  const supabase = createServerClient(ENV.NEXT_PUBLIC_SUPABASE_URL!, ENV.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value,
          ...options
        })
        response = NextResponse.next({
          request: {
            headers: request.headers
          }
        })
        response.cookies.set({
          name,
          value,
          ...options
        })
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value: '',
          ...options
        })
        response = NextResponse.next({
          request: {
            headers: request.headers
          }
        })
        response.cookies.set({
          name,
          value: '',
          ...options
        })
      }
    }
  })

  const {
    data: { user }
  } = await supabase.auth.getUser()

  const isAuthPage =
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/signup') ||
    request.nextUrl.pathname.startsWith('/forgot-password') ||
    request.nextUrl.pathname.startsWith('/reset-password')

  // Public API routes that don't require authentication
  const isPublicApi =
    request.nextUrl.pathname.startsWith('/api/auth') || request.nextUrl.pathname.startsWith('/api/inngest')

  if (!user && !isAuthPage && !isPublicApi) {
    // For API routes, return 401 Unauthorized
    if (request.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    // For page routes, redirect to login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isAuthPage) {
    // Redirect authenticated users away from auth pages
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - image files (svg, png, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
}
