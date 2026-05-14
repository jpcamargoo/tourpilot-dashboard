import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Inclui o arquivo SQLite (dev.db) nas serverless functions do Vercel
  outputFileTracingIncludes: {
    '/**/*': ['./prisma/dev.db'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb', // Reduzido de 5mb para segurança
    },
  },
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

const sentryConfig = {
  // Suprimir warnings de source map em dev
  silent: true,

  // Organização e projeto Sentry
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Upload dos source maps automaticamente
  widenClientFileUpload: true,

  // Esconde source maps dos usuários finais
  hideSourceMaps: true,

  // Desabilita logger para reduzir bundle size
  disableLogger: true,

  // Tunnel para evitar ad-blockers (opcional)
  // tunnelRoute: '/monitoring-tunnel',
};

export default process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryConfig)
  : nextConfig;
