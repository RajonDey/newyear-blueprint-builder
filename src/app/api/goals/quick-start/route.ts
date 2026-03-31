import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"
import { planLimits } from "@/lib/config"
import { sanitizeRichTextHtml } from "@/lib/sanitize"

const quickStartSchema = z.object({
  category: z.enum(["HEALTH", "CAREER", "FINANCE", "RELATIONSHIPS", "SPIRITUALITY", "PASSION"]),
  title: z.string().min(1).max(500),
  description: z.string().max(2000).optional(),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = quickStartSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const userId = session.user.id
  const year = new Date().getFullYear()

  try {
    const result = await db.$transaction(async (tx) => {
      let plan = await tx.yearlyPlan.findFirst({
        where: { userId, status: "ACTIVE" },
      })

      if (!plan) {
        plan = await tx.yearlyPlan.create({
          data: { userId, year, status: "ACTIVE" },
        })
      }

      const limits = planLimits[session.user.planTier]
      const goalCount = await tx.goal.count({ where: { planId: plan.id } })
      if (goalCount >= limits.maxGoalsPerPlan) {
        throw new Error("GOAL_LIMIT")
      }

      const goal = await tx.goal.create({
        data: {
          planId: plan.id,
          category: parsed.data.category,
          type: "PRIMARY",
          title: parsed.data.title,
          description: sanitizeRichTextHtml(parsed.data.description) || null,
          sortOrder: goalCount,
        },
      })

      return { planId: plan.id, goalId: goal.id }
    })

    return NextResponse.json({ data: result }, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "GOAL_LIMIT") {
      return NextResponse.json(
        { error: "Goal limit reached. Upgrade to Pro for more goals." },
        { status: 403 }
      )
    }
    throw err
  }
}
