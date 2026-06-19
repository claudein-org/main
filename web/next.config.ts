import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  serverExternalPackages: ['pg', 'kysely'],
  turbopack: {
  }
}

export default nextConfig
