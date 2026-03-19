import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ goalId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { goalId } = await params
  const goal = await db.goal.findFirst({
    where: { id: goalId, plan: { userId: session.user.id } },
    include: {
      plan: { select: { id: true, year: true } },
      checkpointGoals: { orderBy: { quarter: "asc" } },
      dailySystems: true,
      habits: true,
      motivation: true,
      actions: true,
    },
  })

  if (!goal) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 })
  }

  return NextResponse.json({ data: goal })
}

const updateGoalSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(2000).optional(),
  status: z
    .enum(["NOT_STARTED", "IN_PROGRESS", "ON_TRACK", "AT_RISK", "COMPLETED", "ABANDONED"])
    .optional(),
  type: z.enum(["PRIMARY", "SECONDARY"]).optional(),
})

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ goalId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { goalId } = await params
  const existing = await db.goal.findFirst({
    where: { id: goalId, plan: { userId: session.user.id } },
  })
  if (!existing) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 })
  }

  const body = await req.json()
  const parsed = updateGoalSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const goal = await db.goal.update({
    where: { id: goalId },
    data: parsed.data,
  })

  return NextResponse.json({ data: goal })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ goalId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { goalId } = await params
  const existing = await db.goal.findFirst({
    where: { id: goalId, plan: { userId: session.user.id } },
  })
  if (!existing) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 })
  }

  await db.goal.delete({ where: { id: goalId } })

  return NextResponse.json({ data: { deleted: true } })
}
