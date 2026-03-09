import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Percentual de transações capturadas para performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,

  // Replay de sessão para debug visual
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Habilitar apenas em produção
  enabled: process.env.NODE_ENV === 'production',

  // Integrations
  integrations: [
    Sentry.replayIntegration(),
    Sentry.browserTracingIntegration(),
  ],

  // Ignorar erros comuns do navegador
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    'Non-Error promise rejection captured',
  ],
});
