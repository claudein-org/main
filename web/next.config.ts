import type { NextConfig } from "next"
const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['pg', 'kysely'],
  turbopack: {}
}
export default nextConfig
