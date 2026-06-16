import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken } from '@/lib/auth'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Routes publiques : login, formulaire public par token, API, fichiers statiques (public/)
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/f/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return NextResponse.next()
  }

  const token = req.cookies.get('hr_session')?.value
  const session = await verifySessionToken(token)

  if (!session) {
    const loginUrl = new URL('/login', req.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
}
