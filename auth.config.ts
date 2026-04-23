import type { NextAuthConfig } from 'next-auth'

// Edge-compatible auth config — NO Node.js-only dependencies (no bcryptjs, no PrismaAdapter)
// Used exclusively by middleware.ts which runs in the Edge runtime.
export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const pathname = nextUrl.pathname
      const isAuthRoute =
        pathname.startsWith('/login') || pathname.startsWith('/register')

      if (!isLoggedIn && !isAuthRoute && pathname !== '/') {
        return Response.redirect(new URL('/login', nextUrl))
      }

      if (isLoggedIn && isAuthRoute) {
        return Response.redirect(new URL('/dashboard', nextUrl))
      }

      return true
    },
  },
}
