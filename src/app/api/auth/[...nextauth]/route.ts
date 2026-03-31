import type { NextRequest } from "next/server"
import { handlers } from "@/lib/auth"
import { rateLimitAuthIfConfigured } from "@/lib/rate-limit-auth"

/** Rate limit lives here (Node) so Edge middleware stays under Vercel size limits. */
export async function GET(req: NextRequest) {
  return handlers.GET(req)
}

export async function POST(req: NextRequest) {
  const limited = await rateLimitAuthIfConfigured(req)
  if (limited) return limited
  return handlers.POST(req)
}
