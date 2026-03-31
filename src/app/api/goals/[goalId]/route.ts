import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"
import { sanitizeRichTextHtml } from "@/lib/sanitize"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ goalId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { goalId } = await params
  const goal = await db.goal.findFirst({
    where: { id: goalId, plan: { userId: session.user.id } },
    include: {
      plan: { select: { id: true, year: true } },
      checkpointGoals: { orderBy: { quarter: "asc" } },
      dailySystems: true,
      habits: true,
      motivation: true,
      actions: true,
    },
  })

  if (!goal) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 })
  }

  return NextResponse.json({ data: goal })
}

const updateGoalSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(2000).optional().nullable(),
  status: z
    .enum(["NOT_STARTED", "IN_PROGRESS", "ON_TRACK", "AT_RISK", "COMPLETED", "ABANDONED"])
    .optional(),
  type: z.enum(["PRIMARY", "SECONDARY"]).optional(),
  motivation: z
    .object({
      whyText: z.string().max(5000).optional(),
      consequenceText: z.string().max(5000).optional(),
    })
    .optional(),
})

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ goalId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { goalId } = await params
  const existing = await db.goal.findFirst({
    where: { id: goalId, plan: { userId: session.user.id } },
  })
  if (!existing) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 })
  }

  const body = await req.json()
  const parsed = updateGoalSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const { motivation, title, description, status, type } = parsed.data
  const safeDescription =
    description === undefined ? undefined : sanitizeRichTextHtml(description) || null
  const goalUpdate = Object.fromEntries(
    [
      ["title", title],
      ["description", safeDescription],
      ["status", status],
      ["type", type],
    ].filter(([, v]) => v !== undefined)
  )

  const goal = await db.$transaction(async (tx) => {
    let updated = existing
    if (Object.keys(goalUpdate).length > 0) {
      updated = await tx.goal.update({
        where: { id: goalId },
        data: goalUpdate,
      })
    }

    if (motivation && (motivation.whyText !== undefined || motivation.consequenceText !== undefined)) {
      const prev = await tx.motivation.findUnique({ where: { goalId } })
      await tx.motivation.upsert({
        where: { goalId },
        create: {
          goalId,
          whyText:
            sanitizeRichTextHtml(motivation.whyText) ||
            prev?.whyText ||
            "",
          consequenceText:
            sanitizeRichTextHtml(motivation.consequenceText) ||
            prev?.consequenceText ||
            "",
        },
        update: {
          ...(motivation.whyText !== undefined && {
            whyText: sanitizeRichTextHtml(motivation.whyText),
          }),
          ...(motivation.consequenceText !== undefined && {
            consequenceText: sanitizeRichTextHtml(motivation.consequenceText),
          }),
        },
      })
    }

    if (
      status === "COMPLETED" &&
      existing.status !== "COMPLETED"
    ) {
      await tx.achievement.upsert({
        where: {
          userId_type: { userId: session.user.id, type: "goal_completed" },
        },
        create: {
          userId: session.user.id,
          type: "goal_completed",
          title: "Goal Crusher",
        },
        update: {},
      })
    }

    return updated
  })

  const achievementUnlocked =
    status === "COMPLETED" && existing.status !== "COMPLETED"
      ? "goal_completed"
      : null

  return NextResponse.json({ data: goal, achievementUnlocked })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ goalId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { goalId } = await params
  const existing = await db.goal.findFirst({
    where: { id: goalId, plan: { userId: session.user.id } },
  })
  if (!existing) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 })
  }

  await db.goal.delete({ where: { id: goalId } })

  return NextResponse.json({ data: { deleted: true } })
}
