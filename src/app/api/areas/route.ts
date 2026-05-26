import { NextResponse } from "next/server"
import { z } from "zod"
import { LifeCategory } from "@prisma/client"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { planLimits } from "@/lib/config"
import { hasProProductAccess } from "@/lib/plan-access"
import { areaHexByCategory } from "@/lib/level-styles"

const createSchema = z.object({
  name: z.string().trim().min(1).max(60),
  category: z.nativeEnum(LifeCategory).nullish(),
  color: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/u).optional(),
  icon: z.string().trim().max(40).optional(),
  description: z.string().trim().max(280).optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const areas = await db.area.findMany({
    where: { userId: session.user.id },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  })
  return NextResponse.json({ data: areas })
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

  const isPro = hasProProductAccess(session.user.planTier, session.user.role)
  if (!isPro) {
    // Free tier: only the six default areas; no custom areas.
    return NextResponse.json(
      {
        error: "AREA_LIMIT",
        message:
          "Free plans include six default areas. Custom areas unlock with Pro.",
        upgradeUrl: "/pricing",
      },
      { status: 402 },
    )
  }

  const limits = planLimits[session.user.planTier]
  const existing = await db.area.count({ where: { userId: session.user.id } })
  if (existing >= limits.maxAreas) {
    return NextResponse.json(
      {
        error: "AREA_LIMIT",
        message: `Reached the cap of ${limits.maxAreas} areas.`,
      },
      { status: 402 },
    )
  }

  const category = parsed.data.category ?? null
  const fallbackColor = category ? areaHexByCategory[category] : "#d4a05c"

  const created = await db.area.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      category,
      color: parsed.data.color ?? fallbackColor,
      icon: parsed.data.icon ?? null,
      description: parsed.data.description ?? null,
      sortOrder: existing,
      isDefault: false,
    },
  })

  return NextResponse.json({ data: created }, { status: 201 })
}
