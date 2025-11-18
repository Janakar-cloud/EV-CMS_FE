/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbo: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  experimental: {
    turbo: {
      resolveAlias: {
        '@': './src',
      },
    },
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
  },
}

module.exports = nextConfig