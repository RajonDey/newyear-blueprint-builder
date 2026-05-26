import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

const reorderSchema = z.object({
  itemIds: z.array(z.string().trim().min(1)).min(1).max(200),
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

  const vision = await db.vision.findUnique({
    where: { userId: session.user.id },
    select: { id: true, items: { select: { id: true } } },
  })
  if (!vision) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const ownedIds = new Set(vision.items.map((i) => i.id))
  for (const id of parsed.data.itemIds) {
    if (!ownedIds.has(id)) {
      return NextResponse.json({ error: "Invalid item id" }, { status: 400 })
    }
  }

  await db.$transaction(
    parsed.data.itemIds.map((id, idx) =>
      db.visionItem.update({ where: { id }, data: { order: idx } }),
    ),
  )

  return NextResponse.json({ ok: true })
}
