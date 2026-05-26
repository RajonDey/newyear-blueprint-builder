import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

/**
 * Reorder areas. Body is an array of area IDs in the desired top-to-bottom
 * order; we update each area's `sortOrder` to its array index in a single
 * transaction. We verify every ID belongs to the calling user before writing
 * — a single stranger ID rejects the whole call.
 */
const reorderSchema = z.object({
  areaIds: z.array(z.string().trim().min(1)).min(1).max(200),
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

  const owned = await db.area.findMany({
    where: { userId: session.user.id },
    select: { id: true },
  })
  const ownedSet = new Set(owned.map((a) => a.id))
  for (const id of parsed.data.areaIds) {
    if (!ownedSet.has(id)) {
      return NextResponse.json({ error: "Invalid area id" }, { status: 400 })
    }
  }

  await db.$transaction(
    parsed.data.areaIds.map((id, idx) =>
      db.area.update({ where: { id }, data: { sortOrder: idx } }),
    ),
  )

  return NextResponse.json({ ok: true })
}
