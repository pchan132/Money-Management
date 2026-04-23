import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['pg', 'bcryptjs', '@prisma/client', '.prisma/client'],
}

export default nextConfig
