import { NextResponse } from "next/server"
import { z } from "zod"
import { LifeCategory } from "@prisma/client"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

/**
 * PATCH /api/anti-goals/[antiGoalId]
 *
 * In-place edit of an anti-goal owned by the current user. We allow editing
 * the description (the actual no) and the optional life-category tag.
 */
const patchSchema = z.object({
  description: z.string().trim().min(1).max(500).optional(),
  category: z.nativeEnum(LifeCategory).nullish(),
})

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ antiGoalId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { antiGoalId } = await ctx.params

  const target = await db.antiGoal.findUnique({
    where: { id: antiGoalId },
    include: { plan: { select: { userId: true } } },
  })
  if (!target) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  if (target.plan.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const updated = await db.antiGoal.update({
    where: { id: antiGoalId },
    data: {
      description: parsed.data.description,
      category:
        parsed.data.category === undefined ? undefined : parsed.data.category,
    },
  })

  return NextResponse.json({ data: updated })
}

/**
 * DELETE /api/anti-goals/[antiGoalId]
 *
 * Removes an anti-goal owned by the current user's active plan.
 * Refuses to act on records owned by another user.
 */
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ antiGoalId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { antiGoalId } = await ctx.params

  const target = await db.antiGoal.findUnique({
    where: { id: antiGoalId },
    include: { plan: { select: { userId: true } } },
  })
  if (!target) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  if (target.plan.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await db.antiGoal.delete({ where: { id: antiGoalId } })
  return NextResponse.json({ ok: true })
}
