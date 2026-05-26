import { NextResponse } from "next/server"
import { z } from "zod"
import { DriftKind } from "@prisma/client"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

const createSchema = z.object({
  content: z.string().trim().min(1).max(5000),
  kind: z.nativeEnum(DriftKind).optional(),
})

/**
 * GET /api/drifts — list unresolved drifts (inbox).
 * POST /api/drifts — capture a new drift.
 *
 * Drifts have no plan-tier quota; they're meant to be a release valve and
 * are typically resolved within minutes. Volume is naturally bounded by
 * the user's own capture frequency.
 */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const rows = await db.drift.findMany({
    where: { userId: session.user.id, resolvedAt: null },
    orderBy: { createdAt: "desc" },
    take: 100,
  })
  return NextResponse.json({ data: rows })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const body = await req.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    )
  }
  const drift = await db.drift.create({
    data: {
      userId: session.user.id,
      content: parsed.data.content,
      kind: parsed.data.kind ?? DriftKind.THOUGHT,
    },
  })
  return NextResponse.json({ data: drift }, { status: 201 })
}
