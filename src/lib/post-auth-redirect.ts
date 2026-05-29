/** Routes that must never be used as a post-auth destination. */
const BLOCKED_CALLBACK_PATHS = new Set([
  "/login",
  "/signup",
  "/auth/continue",
])

export type PostAuthRedirectInput = {
  yearlyPlanCount: number
  callbackUrl?: string | null
}

/**
 * Sanitize a callback path from login middleware or NextAuth.
 * Accepts full URLs (same-origin path extracted) or relative paths only.
 */
export function sanitizeCallbackPath(
  raw: string | null | undefined,
): string | null {
  if (!raw || typeof raw !== "string") return null

  let path = raw.trim()
  if (!path) return null

  try {
    if (path.startsWith("http://") || path.startsWith("https://")) {
      const url = new URL(path)
      path = `${url.pathname}${url.search}${url.hash}`
    }
  } catch {
    return null
  }

  if (!path.startsWith("/") || path.startsWith("//")) return null

  const pathname = path.split(/[?#]/)[0]
  if (BLOCKED_CALLBACK_PATHS.has(pathname)) return null
  if (pathname.startsWith("/api/")) return null

  return path
}

/**
 * Resolve where to send a user immediately after sign-in.
 * New users (no yearly plans) always go to onboarding first.
 */
export function resolvePostAuthRedirect({
  yearlyPlanCount,
  callbackUrl,
}: PostAuthRedirectInput): string {
  if (yearlyPlanCount === 0) {
    return "/onboarding"
  }

  const safeCallback = sanitizeCallbackPath(callbackUrl)
  if (safeCallback) {
    return safeCallback
  }

  return "/dashboard"
}

/** Build the NextAuth callbackUrl that lands on the post-auth resolver. */
export function buildAuthContinueUrl(callbackUrl?: string | null): string {
  const safe = sanitizeCallbackPath(callbackUrl)
  if (safe) {
    return `/auth/continue?callbackUrl=${encodeURIComponent(safe)}`
  }
  return "/auth/continue"
}
