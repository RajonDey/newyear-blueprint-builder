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
import { sanitizeRichTextHtml } from "@/lib/sanitize"

const createSchema = z.object({
  planId: z.string().min(1),
  month: z.number().min(1).max(12),
  year: z.number(),
  /** Preferred — keyed by template field keys (Phase 13). */
  responses: z.record(z.string(), z.string()).optional(),
  summary: z.string().max(5000).optional(),
  winsText: z.string().max(5000).optional(),
  challengesText: z.string().max(5000).optional(),
  adjustments: z.string().max(5000).optional(),
  nextMonthFocus: z.string().max(5000).optional(),
})

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const planId = searchParams.get("planId")

  const reviews = await db.monthlyReview.findMany({
    where: {
      plan: { userId: session.user.id },
      ...(planId ? { planId } : {}),
    },
    orderBy: [{ year: "asc" }, { month: "asc" }],
  })

  return NextResponse.json({ data: reviews })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 })

  if (!hasProProductAccess(session.user.planTier, session.user.role)) {
    return NextResponse.json(
      { error: "Monthly reviews are a Pro feature. Upgrade to unlock." },
      { status: 403 }
    )
  }

  const plan = await db.yearlyPlan.findFirst({
    where: { id: parsed.data.planId, userId: session.user.id },
  })
  if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 })

  const fields = await getReviewTemplateFields(session.user.id, "MONTHLY")
  const responsesSanitized = mergeIncomingReviewResponses(fields, parsed.data)
  const legacy = legacyFromResponses(responsesSanitized)
  const nextMonthFocus =
    parsed.data.nextMonthFocus !== undefined
      ? sanitizeRichTextHtml(parsed.data.nextMonthFocus) || null
      : undefined

  const review = await db.monthlyReview.upsert({
    where: {
      planId_month_year: {
        planId: parsed.data.planId,
        month: parsed.data.month,
        year: parsed.data.year,
      },
    },
    create: {
      planId: parsed.data.planId,
      month: parsed.data.month,
      year: parsed.data.year,
      summary: legacy.summary,
      winsText: legacy.winsText,
      challengesText: legacy.challengesText,
      adjustments: legacy.adjustments,
      nextMonthFocus: nextMonthFocus ?? null,
      responses: responsesSanitized,
    },
    update: {
      summary: legacy.summary,
      winsText: legacy.winsText,
      challengesText: legacy.challengesText,
      adjustments: legacy.adjustments,
      ...(nextMonthFocus !== undefined ? { nextMonthFocus } : {}),
      responses: responsesSanitized,
    },
  })

  return NextResponse.json({ data: review }, { status: 201 })
}
