import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

async function driftForUser(driftId: string, userId: string) {
  return db.drift.findFirst({ where: { id: driftId, userId } })
}

/**
 * In-place edit of a drift's body. Drifts are inbox captures; once a drift
 * has been resolved (promoted to a task, note, or archived) we lock it as a
 * historical record — editing a resolved drift would silently rewrite the
 * audit trail without touching the entity it was promoted into. Users who
 * really want to rewrite a resolved entry can delete it and start over.
 */
const patchSchema = z.object({
  content: z.string().trim().min(1).max(2000),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ driftId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { driftId } = await params
  const existing = await driftForUser(driftId, session.user.id)
  if (!existing) {
    return NextResponse.json({ error: "Drift not found" }, { status: 404 })
  }
  if (existing.resolvedAt) {
    return NextResponse.json(
      {
        error: "RESOLVED",
        message: "Resolved drifts can't be edited — delete to start over.",
      },
      { status: 400 },
    )
  }

  const body = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const updated = await db.drift.update({
    where: { id: driftId },
    data: { content: parsed.data.content },
  })

  return NextResponse.json({ data: updated })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ driftId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { driftId } = await params
  const existing = await driftForUser(driftId, session.user.id)
  if (!existing) {
    return NextResponse.json({ error: "Drift not found" }, { status: 404 })
  }
  await db.drift.delete({ where: { id: driftId } })
  return NextResponse.json({ ok: true })
}
