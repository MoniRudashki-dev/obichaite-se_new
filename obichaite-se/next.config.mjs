import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'media.obichaite-se.com',
        // pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'media.obichaite-se.com',
      },
    ],
  },
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  experimental: {
    serverActions: {
      bodySizeLimit: '4500kb',
    },
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
