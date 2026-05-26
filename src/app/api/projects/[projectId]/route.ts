import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"
import { sanitizeRichTextHtml } from "@/lib/sanitize"
import { visionItemBelongsToUser } from "@/lib/queries/vision-projects"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId: projectId } = await params
  const project = await db.project.findFirst({
    where: { id: projectId, plan: { userId: session.user.id } },
    include: {
      plan: { select: { id: true, year: true } },
      checkpoints: { orderBy: { quarter: "asc" } },
      systems: true,
      motivation: true,
      tasks: true,
    },
  })

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  return NextResponse.json({ data: project })
}

const updateGoalSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(2000).optional().nullable(),
  status: z
    .enum(["NOT_STARTED", "IN_PROGRESS", "ON_TRACK", "AT_RISK", "COMPLETED", "ABANDONED"])
    .optional(),
  type: z.enum(["PRIMARY", "SECONDARY"]).optional(),
  /**
   * Re-anchor the project to a different Area, or detach (`null`) so it
   * floats without an area. We verify ownership of the target Area before
   * applying so users can't reattach to someone else's row.
   */
  areaId: z.string().trim().min(1).nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
  /** Link this year's project to a life-vision board card; null clears the link. */
  visionItemId: z.string().trim().min(1).nullable().optional(),
  motivation: z
    .object({
      whyText: z.string().max(5000).optional(),
      consequenceText: z.string().max(5000).optional(),
    })
    .optional(),
})

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId: projectId } = await params
  const existing = await db.project.findFirst({
    where: { id: projectId, plan: { userId: session.user.id } },
  })
  if (!existing) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  const body = await req.json()
  const parsed = updateGoalSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const { motivation, title, description, status, type, areaId, sortOrder, visionItemId } =
    parsed.data
  const safeDescription =
    description === undefined ? undefined : sanitizeRichTextHtml(description) || null

  // Verify the target Area belongs to the same user before allowing a move.
  // `null` means "detach from any area"; `undefined` means "don't touch."
  let areaUpdate: string | null | undefined = undefined
  if (areaId !== undefined) {
    if (areaId === null) {
      areaUpdate = null
    } else {
      const targetArea = await db.area.findFirst({
        where: { id: areaId, userId: session.user.id },
        select: { id: true },
      })
      if (!targetArea) {
        return NextResponse.json(
          { error: "Target area not found" },
          { status: 404 },
        )
      }
      areaUpdate = targetArea.id
    }
  }

  let visionItemUpdate: string | null | undefined = undefined
  if (visionItemId !== undefined) {
    if (visionItemId === null) {
      visionItemUpdate = null
    } else {
      const ok = await visionItemBelongsToUser(session.user.id, visionItemId)
      if (!ok) {
        return NextResponse.json(
          { error: "Vision item not found" },
          { status: 404 },
        )
      }
      visionItemUpdate = visionItemId
    }
  }

  const projectUpdate = Object.fromEntries(
    [
      ["title", title],
      ["description", safeDescription],
      ["status", status],
      ["type", type],
      ["areaId", areaUpdate],
      ["sortOrder", sortOrder],
      ["visionItemId", visionItemUpdate],
    ].filter(([, v]) => v !== undefined)
  )

  const project = await db.$transaction(async (tx) => {
    let updated = existing
    if (Object.keys(projectUpdate).length > 0) {
      updated = await tx.project.update({
        where: { id: projectId },
        data: projectUpdate,
      })
    }

    if (motivation && (motivation.whyText !== undefined || motivation.consequenceText !== undefined)) {
      const prev = await tx.motivation.findUnique({ where: { projectId } })
      await tx.motivation.upsert({
        where: { projectId },
        create: {
          projectId,
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

  return NextResponse.json({ data: project, achievementUnlocked })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId: projectId } = await params
  const existing = await db.project.findFirst({
    where: { id: projectId, plan: { userId: session.user.id } },
  })
  if (!existing) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  await db.project.delete({ where: { id: projectId } })

  return NextResponse.json({ data: { deleted: true } })
}
