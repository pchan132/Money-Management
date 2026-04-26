import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'

// Use only the edge-compatible auth config - no Node.js-only deps (no pg, bcryptjs, PrismaAdapter)
const { auth } = NextAuth(authConfig)
export const proxy = auth

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
