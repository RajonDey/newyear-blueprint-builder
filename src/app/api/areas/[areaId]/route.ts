import { NextResponse } from "next/server"
import { z } from "zod"
import { LifeCategory } from "@prisma/client"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { hasProProductAccess } from "@/lib/plan-access"

const patchSchema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  category: z.nativeEnum(LifeCategory).nullish(),
  color: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/u).optional(),
  icon: z.string().trim().max(40).nullish(),
  description: z.string().trim().max(280).nullish(),
  sortOrder: z.number().int().min(0).optional(),
})

async function ownArea(userId: string, areaId: string) {
  return db.area.findFirst({ where: { id: areaId, userId } })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ areaId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { areaId } = await params
  const area = await ownArea(session.user.id, areaId)
  if (!area) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const body = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const isPro = hasProProductAccess(session.user.planTier, session.user.role)
  // Free tier can still rename / recolor their six defaults; that's harmless.
  // Only renaming + recoloring is allowed on Free though — gate the other fields.
  const data = isPro
    ? parsed.data
    : {
        name: parsed.data.name,
        color: parsed.data.color,
        description: parsed.data.description,
      }

  const updated = await db.area.update({
    where: { id: area.id },
    data,
  })

  return NextResponse.json({ data: updated })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ areaId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { areaId } = await params
  const area = await ownArea(session.user.id, areaId)
  if (!area) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  if (area.isDefault) {
    return NextResponse.json(
      { error: "DEFAULT_AREA", message: "Default areas can't be deleted." },
      { status: 400 },
    )
  }

  // ON DELETE SET NULL on Project.areaId — projects survive but lose their anchor.
  await db.area.delete({ where: { id: area.id } })
  return NextResponse.json({ ok: true })
}
