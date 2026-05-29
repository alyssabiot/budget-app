import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const isAuth = request.nextUrl.pathname.startsWith('/auth')
  const cookies = request.cookies.getAll()
  const hasSession = cookies.some(c => c.name.startsWith('sb-'))

  console.log('middleware cookies:', cookies.map(c => c.name), 'hasSession:', hasSession, 'path:', request.nextUrl.pathname)

  if (!hasSession && !isAuth) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}