import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getWeekNumber } from "@/lib/utils"
import { z } from "zod"

const lifeCategory = z.enum([
  "HEALTH",
  "CAREER",
  "FINANCE",
  "RELATIONSHIPS",
  "SPIRITUALITY",
  "PASSION",
])

const upsertSchema = z.object({
  planId: z.string().min(1),
  priorityGoalIds: z.array(z.string()).max(3),
  protectCategory: lifeCategory.nullable().optional(),
  commitments: z
    .array(
      z.object({
        text: z.string().min(1).max(500).trim(),
        kind: z.enum(["core", "follow_up"]),
      })
    )
    .max(12)
    .optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const weekNumber = getWeekNumber(now)
  const year = now.getFullYear()

  const plan = await db.yearlyPlan.findFirst({
    where: { userId: session.user.id, status: "ACTIVE" },
    select: { id: true },
  })
  if (!plan) {
    return NextResponse.json({ data: null })
  }

  const row = await db.weeklyPlan.findUnique({
    where: {
      planId_weekNumber_year: {
        planId: plan.id,
        weekNumber,
        year,
      },
    },
  })

  return NextResponse.json({ data: row })
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = upsertSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const { planId, priorityGoalIds, protectCategory, commitments } = parsed.data

  const plan = await db.yearlyPlan.findFirst({
    where: { id: planId, userId: session.user.id, status: "ACTIVE" },
    include: {
      goals: { where: { status: { not: "COMPLETED" } }, select: { id: true } },
    },
  })
  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 })
  }

  const allowed = new Set(plan.goals.map((g) => g.id))
  if (priorityGoalIds.some((id) => !allowed.has(id))) {
    return NextResponse.json(
      { error: "Priority goals must be active goals on this plan." },
      { status: 400 }
    )
  }

  const now = new Date()
  const weekNumber = getWeekNumber(now)
  const year = now.getFullYear()

  const row = await db.weeklyPlan.upsert({
    where: {
      planId_weekNumber_year: {
        planId,
        weekNumber,
        year,
      },
    },
    create: {
      planId,
      weekNumber,
      year,
      priorityGoalIds,
      protectCategory: protectCategory ?? null,
      commitments: commitments ?? [],
    },
    update: {
      priorityGoalIds,
      ...(protectCategory !== undefined && { protectCategory }),
      ...(commitments !== undefined && { commitments }),
    },
  })

  return NextResponse.json({ data: row })
}
