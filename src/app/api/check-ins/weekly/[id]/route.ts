import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { sanitizeRichTextHtml } from "@/lib/sanitize"
import { getIsoWeekContextInTimeZone } from "@/lib/utils"

/**
 * PATCH /api/check-ins/weekly/[id]
 *
 * Allows editing a WeeklyCheckIn **only if it belongs to the user's current
 * ISO week**. Past weeks are locked as historical records — editing them
 * would silently rewrite mood + streak data the rest of the app trusts.
 *
 * We accept the same shape as POST minus the streak/achievement bookkeeping
 * (those already happened at first submission). Project check-ins are
 * fully replaced — we delete the existing rows and re-create from the
 * payload so the user can drop a goal or change a rating cleanly.
 */
const patchSchema = z.object({
  overallMood: z.number().int().min(1).max(5).optional(),
  notes: z.string().max(2000).optional(),
  nextWeekFocus: z.string().max(2000).optional(),
  projectCheckIns: z
    .array(
      z.object({
        projectId: z.string().min(1),
        progressRating: z.number().int().min(1).max(5),
        notes: z.string().max(1000).optional(),
        blockers: z.string().max(1000).optional(),
      }),
    )
    .optional(),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await params

  const existing = await db.weeklyCheckIn.findFirst({
    where: { id, plan: { userId: session.user.id } },
    include: { plan: { select: { id: true, user: { select: { timezone: true } } } } },
  })
  if (!existing) {
    return NextResponse.json({ error: "Check-in not found" }, { status: 404 })
  }

  const tz = existing.plan.user.timezone || "UTC"
  const { weekNumber: currentWeek, year: currentYear } =
    getIsoWeekContextInTimeZone(new Date(), tz)
  if (existing.weekNumber !== currentWeek || existing.year !== currentYear) {
    return NextResponse.json(
      {
        error: "WEEK_LOCKED",
        message:
          "Past weeks are read-only. Edits are only allowed within the current ISO week.",
      },
      { status: 400 },
    )
  }

  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  // If project check-ins are present, verify every projectId belongs to the
  // same plan so we don't accept other users' goal IDs.
  if (parsed.data.projectCheckIns) {
    const allowed = new Set(
      (
        await db.project.findMany({
          where: { planId: existing.plan.id },
          select: { id: true },
        })
      ).map((p) => p.id),
    )
    if (parsed.data.projectCheckIns.some((pc) => !allowed.has(pc.projectId))) {
      return NextResponse.json(
        { error: "Project check-ins must belong to projects on this plan." },
        { status: 400 },
      )
    }
  }

  const safeNotes =
    parsed.data.notes === undefined
      ? undefined
      : sanitizeRichTextHtml(parsed.data.notes) || null
  const safeFocus =
    parsed.data.nextWeekFocus === undefined
      ? undefined
      : sanitizeRichTextHtml(parsed.data.nextWeekFocus) || null

  const updated = await db.$transaction(async (tx) => {
    const wci = await tx.weeklyCheckIn.update({
      where: { id },
      data: {
        overallMood: parsed.data.overallMood,
        notes: safeNotes,
        nextWeekFocus: safeFocus,
      },
    })

    if (parsed.data.projectCheckIns) {
      await tx.projectCheckIn.deleteMany({ where: { weeklyCheckInId: id } })
      await tx.projectCheckIn.createMany({
        data: parsed.data.projectCheckIns.map((pc) => ({
          weeklyCheckInId: id,
          projectId: pc.projectId,
          progressRating: pc.progressRating,
          notes: pc.notes ? sanitizeRichTextHtml(pc.notes) || null : null,
          blockers: pc.blockers
            ? sanitizeRichTextHtml(pc.blockers) || null
            : null,
        })),
      })
    }

    return wci
  })

  return NextResponse.json({ data: updated })
}
