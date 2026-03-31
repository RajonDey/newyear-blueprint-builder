import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { planLimits } from "@/lib/config"
import { sanitizeRichTextHtml } from "@/lib/sanitize"
import { wizardSubmitSchema } from "@/lib/validations/wizard"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = wizardSubmitSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { year, reflections, goals, antiGoals } = parsed.data
  const userId = session.user.id
  const limits = planLimits[session.user.planTier]

  const safeReflections = {
    wins: sanitizeRichTextHtml(reflections.wins),
    challenges: sanitizeRichTextHtml(reflections.challenges),
    gratitude: sanitizeRichTextHtml(reflections.gratitude),
    lessons: sanitizeRichTextHtml(reflections.lessons),
  }

  const safeGoals = goals.map((g) => ({
    ...g,
    description: sanitizeRichTextHtml(g.description) || null,
    motivation: {
      whyText: sanitizeRichTextHtml(g.motivation.whyText),
      consequenceText: sanitizeRichTextHtml(g.motivation.consequenceText),
    },
    checkpoints: g.checkpoints.map((cp) => ({
      ...cp,
      description: sanitizeRichTextHtml(cp.description) || null,
    })),
  }))

  const existingPlan = await db.yearlyPlan.findUnique({
    where: { userId_year: { userId, year } },
    include: { goals: { select: { id: true } } },
  })
  
  if (existingPlan) {
    if (existingPlan.goals.length > 0) {
      return NextResponse.json(
        { error: `You already have a full plan for ${year}.` },
        { status: 409 }
      )
    }
  }

  const planCount = await db.yearlyPlan.count({ where: { userId } })
  if (!existingPlan && planCount >= limits.maxPlans) {
    return NextResponse.json(
      { error: "Plan limit reached. Upgrade to Pro for more plans." },
      { status: 403 }
    )
  }

  if (safeGoals.length > limits.maxGoalsPerPlan) {
    return NextResponse.json(
      { error: `Goal limit is ${limits.maxGoalsPerPlan}. Upgrade to Pro for more.` },
      { status: 403 }
    )
  }

  const plan = await db.$transaction(async (tx) => {
    let newPlan

    if (existingPlan) {
      newPlan = await tx.yearlyPlan.update({
        where: { id: existingPlan.id },
        data: { status: "ACTIVE", reflections: safeReflections },
      })
    } else {
      await tx.yearlyPlan.updateMany({
        where: { userId, status: "ACTIVE" },
        data: { status: "ARCHIVED" },
      })

      newPlan = await tx.yearlyPlan.create({
        data: {
          userId,
          year,
          status: "ACTIVE",
          reflections: safeReflections,
        },
      })
    }

    for (let i = 0; i < safeGoals.length; i++) {
      const g = safeGoals[i]
      const goal = await tx.goal.create({
        data: {
          planId: newPlan.id,
          category: g.category,
          type: g.type,
          title: g.title,
          description: g.description,
          sortOrder: i,
        },
      })

      if (g.motivation.whyText || g.motivation.consequenceText) {
        await tx.motivation.create({
          data: {
            goalId: goal.id,
            whyText: g.motivation.whyText || "",
            consequenceText: g.motivation.consequenceText || "",
          },
        })
      }

      if (g.checkpoints.length > 0) {
        await tx.checkpointGoal.createMany({
          data: g.checkpoints.map((cp) => ({
            goalId: goal.id,
            quarter: cp.quarter,
            title: cp.title,
            description: cp.description,
          })),
        })
      }

      if (g.systems.length > 0) {
        await tx.dailySystem.createMany({
          data: g.systems.map((sys) => ({
            goalId: goal.id,
            description: sys.description,
            frequency: sys.frequency,
          })),
        })
      }
    }

    if (antiGoals.length > 0) {
      await tx.antiGoal.createMany({
        data: antiGoals.map((ag) => ({
          planId: newPlan.id,
          description: sanitizeRichTextHtml(ag.description),
          category: ag.category || null,
        })),
      })
    }

    await tx.streak.upsert({
      where: { userId_type: { userId, type: "WEEKLY_CHECK_IN" } },
      create: { userId, type: "WEEKLY_CHECK_IN", currentStreak: 0, longestStreak: 0 },
      update: {},
    })

    await tx.achievement.upsert({
      where: { userId_type: { userId, type: "plan_created" } },
      create: { userId, type: "plan_created", title: "First Plan Created" },
      update: {},
    })

    return newPlan
  })

  return NextResponse.json({ data: plan }, { status: 201 })
}
