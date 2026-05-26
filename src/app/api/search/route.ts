import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { searchUserContent } from "@/lib/queries/search"
import { rateLimitSearchIfConfigured } from "@/lib/rate-limit-search"

/**
 * GET /api/search?q=&limit=20
 *
 * Tenant-scoped search across projects, tasks, notes, drifts (inbox), and areas.
 * Empty `q` returns recent projects for palette defaults.
 */
export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const limited = await rateLimitSearchIfConfigured(session.user.id)
  if (limited) return limited

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") ?? ""
  const rawLimit = Number.parseInt(searchParams.get("limit") ?? "20", 10)
  const limit = Number.isFinite(rawLimit) ? rawLimit : 20

  const data = await searchUserContent(session.user.id, q, limit)
  return NextResponse.json({ data })
}
