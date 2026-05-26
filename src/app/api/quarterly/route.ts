import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { hasProProductAccess } from "@/lib/plan-access"
import { z } from "zod"

import {
  getReviewTemplateFields,
  legacyFromResponses,
  mergeIncomingReviewResponses,
} from "@/lib/review-templates"

const createSchema = z.object({
  planId: z.string().min(1),
  quarter: z.enum(["Q1", "Q2", "Q3", "Q4"]),
  responses: z.record(z.string(), z.string()).optional(),
  summary: z.string().max(5000).optional(),
  winsText: z.string().max(5000).optional(),
  challengesText: z.string().max(5000).optional(),
  adjustments: z.string().max(5000).optional(),
  wheelOfLifeSnapshot: z.record(z.string(), z.number()).optional(),
})

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const planId = searchParams.get("planId")

  const reviews = await db.quarterlyReview.findMany({
    where: {
      plan: { userId: session.user.id },
      ...(planId ? { planId } : {}),
    },
    orderBy: { quarter: "asc" },
  })

  return NextResponse.json({ data: reviews })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  if (!hasProProductAccess(session.user.planTier, session.user.role)) {
    return NextResponse.json(
      { error: "Quarterly reviews are a Pro feature. Upgrade to unlock." },
      { status: 403 }
    )
  }

  const plan = await db.yearlyPlan.findFirst({
    where: { id: parsed.data.planId, userId: session.user.id },
  })
  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 })
  }

  const fields = await getReviewTemplateFields(session.user.id, "QUARTERLY")
  const responsesSanitized = mergeIncomingReviewResponses(fields, parsed.data)
  const legacy = legacyFromResponses(responsesSanitized)

  const review = await db.quarterlyReview.upsert({
    where: {
      planId_quarter: {
        planId: parsed.data.planId,
        quarter: parsed.data.quarter as "Q1" | "Q2" | "Q3" | "Q4",
      },
    },
    create: {
      planId: parsed.data.planId,
      quarter: parsed.data.quarter as "Q1" | "Q2" | "Q3" | "Q4",
      summary: legacy.summary,
      winsText: legacy.winsText,
      challengesText: legacy.challengesText,
      adjustments: legacy.adjustments,
      responses: responsesSanitized,
      wheelOfLifeSnapshot: parsed.data.wheelOfLifeSnapshot ?? undefined,
    },
    update: {
      summary: legacy.summary,
      winsText: legacy.winsText,
      challengesText: legacy.challengesText,
      adjustments: legacy.adjustments,
      responses: responsesSanitized,
      ...(parsed.data.wheelOfLifeSnapshot !== undefined
        ? { wheelOfLifeSnapshot: parsed.data.wheelOfLifeSnapshot }
        : {}),
    },
  })

  await db.achievement.upsert({
    where: { userId_type: { userId: session.user.id, type: "quarter_complete" } },
    create: { userId: session.user.id, type: "quarter_complete", title: "Quarter Done" },
    update: {},
  })

  return NextResponse.json({ data: review }, { status: 201 })
}
