// frontend/proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  const protectedPaths = ['/home', '/watch', '/profile', '/my-list', '/pricing']
  const isPathProtected = protectedPaths.some(path => pathname.startsWith(path))

  if (isPathProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/'
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}