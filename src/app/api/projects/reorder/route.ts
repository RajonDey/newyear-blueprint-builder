import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

/**
 * Reorder projects. Body is an array of project IDs in the desired
 * top-to-bottom order; we update each project's `sortOrder` to its array
 * index in a single transaction. We verify every ID belongs to one of the
 * calling user's plans before writing — a single stranger ID rejects the
 * whole call.
 *
 * URL keeps the legacy `/projects/...` segment since the underlying DB table
 * is still `goals` (renamed in code via Prisma `@@map`).
 */
const reorderSchema = z.object({
  projectIds: z.array(z.string().trim().min(1)).min(1).max(200),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = reorderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const owned = await db.project.findMany({
    where: { plan: { userId: session.user.id } },
    select: { id: true },
  })
  const ownedSet = new Set(owned.map((p) => p.id))
  for (const id of parsed.data.projectIds) {
    if (!ownedSet.has(id)) {
      return NextResponse.json({ error: "Invalid project id" }, { status: 400 })
    }
  }

  await db.$transaction(
    parsed.data.projectIds.map((id, idx) =>
      db.project.update({ where: { id }, data: { sortOrder: idx } }),
    ),
  )

  return NextResponse.json({ ok: true })
}
