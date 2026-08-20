import path from 'path'
import type { NextConfig } from 'next'

const remotePatterns = [
  {
    protocol: 'https' as const,
    hostname: 'images.unsplash.com',
  },
]

if (process.env.NEXT_PUBLIC_R2_PUBLIC_URL) {
  const publicR2Url = new URL(process.env.NEXT_PUBLIC_R2_PUBLIC_URL)
  if (publicR2Url.protocol !== 'https:') {
    throw new Error('NEXT_PUBLIC_R2_PUBLIC_URL must use HTTPS')
  }
  remotePatterns.push({ protocol: 'https', hostname: publicR2Url.hostname })
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
}

export default nextConfig
