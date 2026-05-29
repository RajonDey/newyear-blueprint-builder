import * as Sentry from "@sentry/nextjs"
import { getSentryOptions } from "@/lib/sentry-options"

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    Sentry.init(getSentryOptions())
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    Sentry.init(getSentryOptions())
  }
}

export const onRequestError = Sentry.captureRequestError
