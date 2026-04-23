import { handlers } from '@/lib/auth'

// Expose NextAuth GET/POST handler at /api/auth/[...nextauth]
export const { GET, POST } = handlers
