import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { NextResponse } from "next/server"

let cachedLimiter: Ratelimit | null | undefined

function getExportLimiter(): Ratelimit | null {
  if (cachedLimiter !== undefined) return cachedLimiter
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    cachedLimiter = null
    return null
  }
  cachedLimiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(1, "1 h"),
    prefix: "yir:export",
  })
  return cachedLimiter
}

/** Rate-limit data export by user id (1 req/hour when Upstash is configured). */
export async function rateLimitExportIfConfigured(
  userId: string,
): Promise<NextResponse | null> {
  const limiter = getExportLimiter()
  if (!limiter) return null

  const { success, limit, reset, remaining } = await limiter.limit(userId)
  if (success) return null

  const retrySec = Math.max(1, Math.ceil((reset - Date.now()) / 1000))
  return NextResponse.json(
    { error: "You can export once per hour. Try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retrySec),
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": String(remaining),
      },
    },
  )
}
