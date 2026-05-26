import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { planLimits } from "@/lib/config"
import { LifeCategory } from "@prisma/client"

const createSchema = z.object({
  description: z.string().trim().min(1).max(500),
  category: z.nativeEnum(LifeCategory).nullish(),
})

/**
 * Anti-goals API for the current active plan.
 *
 * GET   /api/anti-goals          List anti-goals for the user's active plan.
 * POST  /api/anti-goals          Create one (enforces `maxAntiGoalsPerPlan`).
 *
 * Individual deletes live at `/api/anti-goals/[antiGoalId]`.
 */
async function getActivePlanId(userId: string) {
  const plan = await db.yearlyPlan.findFirst({
    where: { userId, status: "ACTIVE" },
    select: { id: true },
  })
  return plan?.id ?? null
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const planId = await getActivePlanId(session.user.id)
  if (!planId) {
    return NextResponse.json({ data: [], planId: null })
  }
  const items = await db.antiGoal.findMany({
    where: { planId },
    orderBy: { id: "asc" },
  })
  return NextResponse.json({ data: items, planId })
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

  const planId = await getActivePlanId(session.user.id)
  if (!planId) {
    return NextResponse.json(
      { error: "Create your yearly plan before adding anti-goals." },
      { status: 409 },
    )
  }

  const cap = planLimits[session.user.planTier].maxAntiGoalsPerPlan
  const existing = await db.antiGoal.count({ where: { planId } })
  if (existing >= cap) {
    return NextResponse.json(
      {
        error: "ANTI_GOAL_LIMIT",
        message: `Free plans are capped at ${cap} anti-goals. Upgrade to Pro for more.`,
      },
      { status: 403 },
    )
  }

  const created = await db.antiGoal.create({
    data: {
      planId,
      description: parsed.data.description,
      category: parsed.data.category ?? null,
    },
  })
  return NextResponse.json({ data: created }, { status: 201 })
}
