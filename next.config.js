/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  env: {
    WORKER_URL: process.env.WORKER_URL || 'http://localhost:8787',
  },
}

module.exports = nextConfig
