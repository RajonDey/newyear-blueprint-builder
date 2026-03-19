import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"
import { planLimits } from "@/lib/config"

const createPlanSchema = z.object({
  year: z.number().int().min(2024).max(2100),
})

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const plans = await db.yearlyPlan.findMany({
    where: { userId: session.user.id },
    include: {
      goals: { select: { id: true, title: true, category: true, status: true } },
      _count: { select: { weeklyCheckIns: true } },
    },
    orderBy: { year: "desc" },
  })

  return NextResponse.json({ data: plans })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = createPlanSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const limits = planLimits[session.user.planTier]
  const existingCount = await db.yearlyPlan.count({
    where: { userId: session.user.id },
  })

  if (existingCount >= limits.maxPlans) {
    return NextResponse.json(
      { error: "Plan limit reached. Upgrade to Pro for more plans." },
      { status: 403 }
    )
  }

  const plan = await db.yearlyPlan.create({
    data: {
      userId: session.user.id,
      year: parsed.data.year,
      status: "DRAFT",
    },
  })

  return NextResponse.json({ data: plan }, { status: 201 })
}
