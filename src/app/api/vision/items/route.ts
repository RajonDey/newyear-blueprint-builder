import { NextResponse } from "next/server"
import { z } from "zod"
import { VisionItemKind } from "@prisma/client"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { planLimits } from "@/lib/config"

const createSchema = z.object({
  kind: z.nativeEnum(VisionItemKind),
  title: z.string().trim().min(1).max(120),
  body: z.string().trim().max(2000).optional(),
  imageUrl: z.string().trim().url().optional(),
  areaId: z.string().trim().optional(),
})

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

  const vision = await db.vision.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id },
    update: {},
    select: { id: true, _count: { select: { items: true } } },
  })

  const cap = planLimits[session.user.planTier].maxVisionItems
  if (vision._count.items >= cap) {
    return NextResponse.json(
      {
        error: "VISION_LIMIT",
        message: `Reached ${cap} vision items on this plan.`,
        upgradeUrl: "/pricing",
      },
      { status: 402 },
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

  const created = await db.visionItem.create({
    data: {
      visionId: vision.id,
      kind: parsed.data.kind,
      title: parsed.data.title,
      body: parsed.data.body ?? null,
      imageUrl: parsed.data.imageUrl ?? null,
      areaId: parsed.data.areaId ?? null,
      order: vision._count.items,
    },
  })

  return NextResponse.json({ data: created }, { status: 201 })
}
