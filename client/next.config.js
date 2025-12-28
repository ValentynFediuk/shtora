/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.directus.io',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  env: {
    DIRECTUS_URL: process.env.DIRECTUS_URL,
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
    NOVA_POSHTA_API_KEY: process.env.NOVA_POSHTA_API_KEY,
  },
}

module.exports = nextConfig
