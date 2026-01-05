// Sentry Configuration
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: 1.0,
  
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Ignore certain errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'Can\'t find variable: ZiteReader',
    'jigsaw is not defined',
    'ComboSearch is not defined',
    // Network errors
    'NetworkError',
    'Failed to fetch',
  ],
  
  // Configure integrations
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Filter transactions
  beforeSend(event, hint) {
    // Filter out non-critical errors in development
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return event;
  },
});
