/**
 * Error tracking integration
 * Supports Sentry and other error tracking services
 */

const isProduction = import.meta.env.PROD;

/**
 * Initialize error tracking
 */
export function initErrorTracking() {
  if (!isProduction) {
    return;
  }

  // TODO: Initialize Sentry when DSN is available
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (sentryDsn) {
    // Sentry will be initialized here
    // import * as Sentry from "@sentry/react";
    // Sentry.init({
    //   dsn: sentryDsn,
    //   integrations: [new Sentry.BrowserTracing()],
    //   tracesSampleRate: 1.0,
    // });
  }
}

/**
 * Capture an exception
 */
export function captureException(error: Error, context?: Record<string, unknown>) {
  if (!isProduction) {
    console.error('Error (dev):', error, context);
    return;
  }

  // TODO: Send to Sentry
  // Sentry.captureException(error, { extra: context });
  
  // Fallback: log to console in production
  console.error('Error:', error, context);
}

/**
 * Capture a message
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (!isProduction) {
    console.log(`[${level.toUpperCase()}]`, message);
    return;
  }

  // TODO: Send to Sentry
  // Sentry.captureMessage(message, level);
}

/**
 * Set user context for error tracking
 */
export function setUserContext(userId: string, email?: string, name?: string) {
  if (!isProduction) return;

  // TODO: Set Sentry user context
  // Sentry.setUser({ id: userId, email, username: name });
}

