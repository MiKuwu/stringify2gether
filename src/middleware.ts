import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  
  if (token) {
    if (token.bannedUntil) {
      const bannedUntil = new Date(token.bannedUntil as string)
      if (bannedUntil > new Date()) {
        const url = req.nextUrl.clone()
        // Allow access to /banned, /api/auth, /api/appeals
        if (!url.pathname.startsWith('/banned') && 
            !url.pathname.startsWith('/api/auth') && 
            !url.pathname.startsWith('/api/appeals') &&
            !url.pathname.startsWith('/_next')
        ) {
          url.pathname = '/banned'
          return NextResponse.redirect(url)
        }
      }
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
