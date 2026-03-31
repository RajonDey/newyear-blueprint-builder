import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const updateSchema = z.object({
  description: z.string().min(1).max(500).trim().optional(),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY"]).optional(),
  isActive: z.boolean().optional(),
})

async function systemForUser(systemId: string, userId: string) {
  return db.dailySystem.findFirst({
    where: {
      id: systemId,
      goal: { plan: { userId } },
    },
  })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ systemId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { systemId } = await params
  const existing = await systemForUser(systemId, session.user.id)
  if (!existing) {
    return NextResponse.json({ error: "System not found" }, { status: 404 })
  }

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const system = await db.dailySystem.update({
    where: { id: systemId },
    data: parsed.data,
  })

  return NextResponse.json({ data: system })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ systemId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { systemId } = await params
  const existing = await systemForUser(systemId, session.user.id)
  if (!existing) {
    return NextResponse.json({ error: "System not found" }, { status: 404 })
  }

  await db.dailySystem.delete({ where: { id: systemId } })

  return NextResponse.json({ data: { deleted: true } })
}
