/**
 * Environment-aware logging utility
 * Removes console statements in production
 */

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

interface Logger {
  log: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
}

/**
 * Logger that only outputs in development mode
 * In production, logs are suppressed to prevent information leakage
 */
export const logger: Logger = {
  log: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  error: (...args: unknown[]) => {
    // Always log errors, but in production send to error tracking
    if (isDevelopment) {
      console.error(...args);
    } else {
      // In production, send to error tracking service
      // This will be integrated with Sentry later
      console.error(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  info: (...args: unknown[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
};

/**
 * Logs errors to external service (Sentry, etc.)
 * This will be implemented when error tracking is set up
 */
export function logErrorToService(error: Error, context?: Record<string, unknown>) {
  if (isProduction) {
    // TODO: Integrate with Sentry or other error tracking
    // For now, just log to console in production
    console.error('Error logged:', error, context);
  } else {
    console.error('Error (dev):', error, context);
  }
}

