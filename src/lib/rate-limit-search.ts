import type { ParentType } from "@prisma/client"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { NextResponse } from "next/server"

let cachedLimiter: Ratelimit | null | undefined

function getSearchLimiter(): Ratelimit | null {
  if (cachedLimiter !== undefined) return cachedLimiter
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    cachedLimiter = null
    return null
  }
  cachedLimiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(30, "1 m"),
    prefix: "yir:search",
  })
  return cachedLimiter
}

/** Rate-limit global search by user id (30 req/min when Upstash is configured). */
export async function rateLimitSearchIfConfigured(
  userId: string,
): Promise<NextResponse | null> {
  const limiter = getSearchLimiter()
  if (!limiter) return null

  const { success, limit, reset, remaining } = await limiter.limit(userId)
  if (success) return null

  const retrySec = Math.max(1, Math.ceil((reset - Date.now()) / 1000))
  return NextResponse.json(
    { error: "Too many search requests. Slow down for a moment." },
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
