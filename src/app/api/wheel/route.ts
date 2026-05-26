import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const wheelEntriesSchema = z.array(
  z.object({
    category: z.enum([
      "HEALTH",
      "CAREER",
      "FINANCE",
      "RELATIONSHIPS",
      "SPIRITUALITY",
      "PASSION",
    ]),
    rating: z.number().int().min(1).max(10),
  }),
)

const createWheelEntrySchema = z.object({
  planId: z.string().min(1),
  entries: wheelEntriesSchema,
  context: z.string().optional(),
})

const patchWheelSchema = z.object({
  planId: z.string().min(1),
  entries: wheelEntriesSchema,
  context: z.string().optional(),
})

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const planId = searchParams.get("planId")

  const entries = await db.wheelOfLifeEntry.findMany({
    where: {
      plan: { userId: session.user.id },
      ...(planId ? { planId } : {}),
    },
    orderBy: { recordedAt: "asc" },
  })

  return NextResponse.json({ data: entries })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = createWheelEntrySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const plan = await db.yearlyPlan.findFirst({
    where: { id: parsed.data.planId, userId: session.user.id },
  })
  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 })
  }

  // All six rows in a single snapshot share one timestamp so the grouping
  // logic in `lib/queries/wheel.ts` buckets them together.
  const recordedAt = new Date()
  const entries = await db.$transaction(
    parsed.data.entries.map((entry) =>
      db.wheelOfLifeEntry.create({
        data: {
          planId: parsed.data.planId,
          category: entry.category,
          rating: entry.rating,
          context: parsed.data.context,
          recordedAt,
        },
      })
    )
  )

  return NextResponse.json({ data: entries }, { status: 201 })
}

/**
 * PATCH /api/wheel
 *
 * Corrects the **most recent snapshot** for a plan in place — same shape
 * as POST, but instead of inserting a new versioned row group we update the
 * existing six rows so the user can fix a typo or rethink a score right
 * after saving without polluting their history.
 *
 * If there is no snapshot for the plan yet we 404 — the client should fall
 * back to POST.
 */
export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = patchWheelSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const plan = await db.yearlyPlan.findFirst({
    where: { id: parsed.data.planId, userId: session.user.id },
    select: { id: true },
  })
  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 })
  }

  // The most recent snapshot is whichever 6 rows share the highest
  // `recordedAt` for this plan. We look up that timestamp and update the
  // rows for that timestamp by (category, planId, recordedAt).
  const mostRecent = await db.wheelOfLifeEntry.findFirst({
    where: { planId: plan.id },
    orderBy: { recordedAt: "desc" },
    select: { recordedAt: true },
  })
  if (!mostRecent) {
    return NextResponse.json(
      { error: "No snapshot to update yet — POST a new one first." },
      { status: 404 },
    )
  }

  const recordedAt = mostRecent.recordedAt
  const updated = await db.$transaction(
    parsed.data.entries.map((entry) =>
      db.wheelOfLifeEntry.updateMany({
        where: {
          planId: plan.id,
          recordedAt,
          category: entry.category,
        },
        data: {
          rating: entry.rating,
          context: parsed.data.context,
        },
      }),
    ),
  )

  return NextResponse.json({ data: { updated: updated.length, recordedAt } })
}
