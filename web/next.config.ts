import type { NextConfig } from "next"
const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['pg', 'kysely', '@aws-sdk/client-s3'],
  turbopack: {},
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
}
export default nextConfig
