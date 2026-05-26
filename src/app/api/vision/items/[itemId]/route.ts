import { NextResponse } from "next/server"
import { z } from "zod"
import { VisionItemKind } from "@prisma/client"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

const patchSchema = z.object({
  kind: z.nativeEnum(VisionItemKind).optional(),
  title: z.string().trim().min(1).max(120).optional(),
  body: z.string().trim().max(2000).nullish(),
  imageUrl: z.string().trim().url().nullish(),
  areaId: z.string().trim().nullish(),
  achievedAt: z
    .union([z.string().datetime(), z.literal("now"), z.null()])
    .optional(),
})

async function ownItem(userId: string, itemId: string) {
  return db.visionItem.findFirst({
    where: { id: itemId, vision: { userId } },
  })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ itemId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { itemId } = await params
  const item = await ownItem(session.user.id, itemId)
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  if (parsed.data.areaId) {
    const area = await db.area.findFirst({
      where: { id: parsed.data.areaId, userId: session.user.id },
      select: { id: true },
    })
    if (!area) {
      return NextResponse.json({ error: "Area not found" }, { status: 404 })
    }
  }

  const achievedAt =
    parsed.data.achievedAt === "now"
      ? new Date()
      : parsed.data.achievedAt === null
        ? null
        : parsed.data.achievedAt
          ? new Date(parsed.data.achievedAt)
          : undefined

  const updated = await db.visionItem.update({
    where: { id: item.id },
    data: {
      kind: parsed.data.kind,
      title: parsed.data.title,
      body: parsed.data.body === undefined ? undefined : parsed.data.body,
      imageUrl: parsed.data.imageUrl === undefined ? undefined : parsed.data.imageUrl,
      areaId: parsed.data.areaId === undefined ? undefined : parsed.data.areaId,
      achievedAt,
    },
  })

  return NextResponse.json({ data: updated })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ itemId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { itemId } = await params
  const item = await ownItem(session.user.id, itemId)
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await db.visionItem.delete({ where: { id: item.id } })
  return NextResponse.json({ ok: true })
}
