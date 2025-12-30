/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Directus SaaS (общий случай)
      {
        protocol: 'https',
        hostname: '**.directus.io',
      },
      // Локальная разработка
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      // Прод-домен Directus на Railway
      {
        protocol: 'https',
        hostname: 'shtora-production.up.railway.app',
        pathname: '/assets/**',
      },
      // Динамический хост Directus из переменных окружения
      ...(() => {
        try {
          const url = process.env.NEXT_PUBLIC_DIRECTUS_URL || process.env.DIRECTUS_URL
          if (!url) return []
          const u = new URL(url)
          return [
            {
              protocol: u.protocol.replace(':', ''),
              hostname: u.hostname,
              pathname: '/assets/**',
            },
          ]
        } catch {
          return []
        }
      })(),
    ],
  },
  env: {
    DIRECTUS_URL: process.env.DIRECTUS_URL,
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
    NOVA_POSHTA_API_KEY: process.env.NOVA_POSHTA_API_KEY,
  },
}

module.exports = nextConfig
