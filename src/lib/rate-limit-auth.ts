import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

let cachedLimiter: Ratelimit | null | undefined

function getAuthLimiter(): Ratelimit | null {
  if (cachedLimiter !== undefined) return cachedLimiter
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    cachedLimiter = null
    return null
  }
  cachedLimiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(60, "1 m"),
    prefix: "yir:auth",
  })
  return cachedLimiter
}

/**
 * Rate-limit /api/auth/* by IP when Upstash is configured.
 * Returns a 429 Response when over limit; otherwise null (caller continues).
 */
export async function rateLimitAuthIfConfigured(req: NextRequest): Promise<NextResponse | null> {
  const limiter = getAuthLimiter()
  if (!limiter) return null

  // Session/CSRF/provider metadata are GETs — limiting them breaks normal browsing (dev + prefetch).
  if (req.method === "GET" || req.method === "HEAD") return null

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"

  const { success, limit, reset, remaining } = await limiter.limit(ip)
  if (success) return null

  const retrySec = Math.max(1, Math.ceil((reset - Date.now()) / 1000))
  return NextResponse.json(
    { error: "Too many sign-in attempts. Please try again in a minute." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retrySec),
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": String(remaining),
      },
    }
  )
}
