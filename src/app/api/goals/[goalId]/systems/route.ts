import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { planLimits } from "@/lib/config"
import { z } from "zod"

const createSchema = z.object({
  description: z.string().min(1).max(500).trim(),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ goalId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { goalId } = await params
  const goal = await db.goal.findFirst({
    where: { id: goalId, plan: { userId: session.user.id } },
    select: { id: true, planId: true },
  })
  if (!goal) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 })
  }

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const limits = planLimits[session.user.planTier]
  const count = await db.dailySystem.count({ where: { goalId } })
  if (count >= limits.maxDailySystemsPerGoal) {
    return NextResponse.json(
      {
        error: `You can add up to ${limits.maxDailySystemsPerGoal} systems per goal on your plan.`,
      },
      { status: 403 }
    )
  }

  const system = await db.dailySystem.create({
    data: {
      goalId,
      description: parsed.data.description,
      frequency: parsed.data.frequency,
    },
  })

  return NextResponse.json({ data: system }, { status: 201 })
}
