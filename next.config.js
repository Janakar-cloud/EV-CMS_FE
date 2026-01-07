/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  turbopack: {
    resolveAlias: {
      '@': './src',
    },
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig