import { NextResponse, type NextRequest } from 'next/server'

import { createServerClient, type CookieOptions } from '@supabase/ssr'

const AUTH_ONLY_PATHS = ['/login', '/register', '/forgot-password', '/reset-password']
const PUBLIC_PATHS = ['/', '/auth/callback', ...AUTH_ONLY_PATHS]

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

    // Get session
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

    const currentPath = request.nextUrl.pathname

    const isAuthOnlyPath = AUTH_ONLY_PATHS.some(path => currentPath.startsWith(path))
    const isPublicPath = PUBLIC_PATHS.some(path => currentPath === path)

    // If logged-in user visits auth-only pages (signup, login, forgot-password, etc.)
    // if (session && isAuthOnlyPath) {
    //   return NextResponse.redirect(new URL('/home', request.url))
    // }

    // If logged-out user visits protected pages (not public)
    if (!session && !isPublicPath) {
      const loginUrl = new URL('/login', request.url)

      loginUrl.searchParams.set('redirect', currentPath)

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
