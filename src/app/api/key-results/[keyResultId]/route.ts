import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const updateKeyResultSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  currentValue: z.number().min(0).optional(),
  targetValue: z.number().positive().optional(),
  unit: z.string().max(50).optional(),
})

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ keyResultId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { keyResultId } = await params
  const existing = await db.keyResult.findFirst({
    where: { id: keyResultId, project: { plan: { userId: session.user.id } } },
  })
  if (!existing) {
    return NextResponse.json({ error: "Key result not found" }, { status: 404 })
  }

  const body = await req.json()
  const parsed = updateKeyResultSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const updated = await db.keyResult.update({
    where: { id: keyResultId },
    data: {
      ...(parsed.data.title !== undefined && { title: parsed.data.title.trim() }),
      ...(parsed.data.currentValue !== undefined && { currentValue: parsed.data.currentValue }),
      ...(parsed.data.targetValue !== undefined && { targetValue: parsed.data.targetValue }),
      ...(parsed.data.unit !== undefined && { unit: parsed.data.unit.trim() }),
    },
  })

  return NextResponse.json({ data: updated })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ keyResultId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { keyResultId } = await params
  const existing = await db.keyResult.findFirst({
    where: { id: keyResultId, project: { plan: { userId: session.user.id } } },
  })
  if (!existing) {
    return NextResponse.json({ error: "Key result not found" }, { status: 404 })
  }

  await db.keyResult.delete({ where: { id: keyResultId } })

  return NextResponse.json({ data: { deleted: true } })
}
