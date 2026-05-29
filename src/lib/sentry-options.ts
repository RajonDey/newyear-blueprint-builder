/** Shared Sentry init options — only active when SENTRY_DSN is set. */
export const sentryEnabled = Boolean(process.env.SENTRY_DSN?.trim())

export function getSentryOptions() {
  return {
    dsn: process.env.SENTRY_DSN,
    enabled: sentryEnabled,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,
    sendDefaultPii: false,
  }
}
