import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getIsoWeekContextInTimeZone } from "@/lib/utils"
import { sanitizeRichTextHtml } from "@/lib/sanitize"
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
  priorityProjectIds: z.array(z.string()).max(3),
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
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { timezone: true },
  })

  const now = new Date()
  const { weekNumber, year } = getIsoWeekContextInTimeZone(
    now,
    user?.timezone || "UTC"
  )

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
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = upsertSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const { planId, priorityProjectIds, protectCategory, commitments } = parsed.data

  const plan = await db.yearlyPlan.findFirst({
    where: { id: planId, userId: session.user.id, status: "ACTIVE" },
    include: {
      projects: { where: { status: { not: "COMPLETED" } }, select: { id: true } },
      user: { select: { timezone: true } },
    },
  })
  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 })
  }

  const allowed = new Set(plan.projects.map((g) => g.id))
  if (priorityProjectIds.some((id) => !allowed.has(id))) {
    return NextResponse.json(
      { error: "Priority projects must be active projects on this plan." },
      { status: 400 }
    )
  }

  const now = new Date()
  const { weekNumber, year } = getIsoWeekContextInTimeZone(
    now,
    plan.user.timezone || "UTC"
  )

  const safeCommitments =
    commitments
      ?.map((row) => ({
        ...row,
        text: sanitizeRichTextHtml(row.text),
      }))
      .filter((row) => row.text.length > 0) ?? undefined

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
      priorityProjectIds,
      protectCategory: protectCategory ?? null,
      commitments: safeCommitments ?? [],
    },
    update: {
      priorityProjectIds,
      ...(protectCategory !== undefined && { protectCategory }),
      ...(safeCommitments !== undefined && { commitments: safeCommitments }),
    },
  })

  return NextResponse.json({ data: row })
}
