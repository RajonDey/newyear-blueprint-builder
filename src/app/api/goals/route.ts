import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"
import { planLimits } from "@/lib/config"

const createGoalSchema = z.object({
  planId: z.string().min(1),
  category: z.enum(["HEALTH", "CAREER", "FINANCE", "RELATIONSHIPS", "SPIRITUALITY", "PASSION"]),
  type: z.enum(["PRIMARY", "SECONDARY"]),
  title: z.string().min(1).max(500),
  description: z.string().max(2000).optional(),
})

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const planId = searchParams.get("planId")

  const goals = await db.goal.findMany({
    where: {
      plan: { userId: session.user.id },
      ...(planId ? { planId } : {}),
    },
    include: {
      actions: true,
      dailySystems: true,
      motivation: true,
      checkpointGoals: true,
    },
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
  })

  return NextResponse.json({ data: goals })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = createGoalSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const plan = await db.yearlyPlan.findFirst({
    where: { id: parsed.data.planId, userId: session.user.id },
  })
  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 })
  }

  const limits = planLimits[session.user.planTier]
  const goalCount = await db.goal.count({ where: { planId: plan.id } })
  if (goalCount >= limits.maxGoalsPerPlan) {
    return NextResponse.json(
      { error: "Goal limit reached. Upgrade to Pro for unlimited goals." },
      { status: 403 }
    )
  }

  const goal = await db.goal.create({
    data: {
      ...parsed.data,
      sortOrder: goalCount,
    },
  })

  return NextResponse.json({ data: goal }, { status: 201 })
}
