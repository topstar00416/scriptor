import { NextResponse, type NextRequest } from 'next/server'

import { createServerClient, type CookieOptions } from '@supabase/ssr'

const PUBLIC_PATHS = ['/', '/home', '/login', '/register', '/auth/callback', '/forgot-password', '/reset-password']

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers
    }
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({ name, value, ...options })
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({ name, value: '', ...options })
            response.cookies.set({ name, value: '', ...options })
          }
        }
      }
    )

    // Get session with debugging
    const {
      data: { session },
      error
    } = await supabase.auth.getSession()

    console.log('Middleware session check:', {
      path: request.nextUrl.pathname,
      hasSession: !!session,
      error: error?.message
    })

    if (error) {
      console.error('Middleware auth error:', error)
      response.cookies.delete('sb-access-token')
      response.cookies.delete('sb-refresh-token')
    }

    const isPublicPath = PUBLIC_PATHS.some(path => request.nextUrl.pathname.startsWith(path))

    if (!session && !isPublicPath) {
      const loginUrl = new URL('/login', request.url)

      loginUrl.searchParams.set('redirect', request.nextUrl.pathname)

      return NextResponse.redirect(loginUrl)
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)

    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|assets|images|fonts).*)']
}
