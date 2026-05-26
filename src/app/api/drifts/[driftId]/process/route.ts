import { NextResponse } from "next/server"
import { z } from "zod"
import { ActionType, GoalStatus, ParentType } from "@prisma/client"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { planLimits } from "@/lib/config"
import { assertParentBelongsToUser } from "@/lib/parent-guard"

/**
 * POST /api/drifts/[driftId]/process — promote a drift into something
 * permanent or dismiss it.
 *
 * Body shapes (discriminated by `target`):
 *
 *   { target: "note",    parentType, parentId, content?: string }
 *   { target: "task",    projectId, description?: string }
 *   { target: "archive" }
 *
 * Notes:
 * - `content` / `description` default to the drift's own content (the common
 *   case — capture once, attach as-is). Pass an override to edit before promote.
 * - On success we mark the drift `resolvedAt = now`, `resolvedAs = <target>`,
 *   `resolvedRef = <new entity id | null>`. The drift row is **kept** for the
 *   audit trail.
 */
const processSchema = z.discriminatedUnion("target", [
  z.object({
    target: z.literal("note"),
    parentType: z.nativeEnum(ParentType),
    parentId: z.string().trim().min(1),
    content: z.string().trim().min(1).max(10_000).optional(),
  }),
  z.object({
    target: z.literal("task"),
    projectId: z.string().trim().min(1),
    description: z.string().trim().min(1).max(500).optional(),
  }),
  z.object({
    target: z.literal("archive"),
  }),
])

export async function POST(
  req: Request,
  { params }: { params: Promise<{ driftId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { driftId } = await params
  const drift = await db.drift.findFirst({
    where: { id: driftId, userId: session.user.id },
  })
  if (!drift) {
    return NextResponse.json({ error: "Drift not found" }, { status: 404 })
  }
  if (drift.resolvedAt) {
    return NextResponse.json(
      { error: "Drift already resolved" },
      { status: 400 },
    )
  }

  const body = await req.json().catch(() => null)
  const parsed = processSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const limits = planLimits[session.user.planTier]

  if (parsed.data.target === "archive") {
    await db.drift.update({
      where: { id: drift.id },
      data: {
        resolvedAt: new Date(),
        resolvedAs: "archived",
        resolvedRef: null,
      },
    })
    return NextResponse.json({ data: { target: "archive" } })
  }

  if (parsed.data.target === "note") {
    const { parentType, parentId, content } = parsed.data
    const ok = await assertParentBelongsToUser(
      session.user.id,
      parentType,
      parentId,
    )
    if (!ok) {
      return NextResponse.json({ error: "Parent not found" }, { status: 404 })
    }
    const noteCount = await db.note.count({
      where: { userId: session.user.id },
    })
    if (noteCount >= limits.maxNotes) {
      return NextResponse.json(
        {
          error: "NOTE_LIMIT",
          message: `Reached the cap of ${limits.maxNotes} notes for your plan.`,
        },
        { status: 402 },
      )
    }

    const userId = session.user.id
    const created = await db.$transaction(async (tx) => {
      const note = await tx.note.create({
        data: {
          userId,
          parentType,
          parentId,
          content: content ?? drift.content,
        },
      })
      await tx.drift.update({
        where: { id: drift.id },
        data: {
          resolvedAt: new Date(),
          resolvedAs: "note",
          resolvedRef: note.id,
        },
      })
      return note
    })
    return NextResponse.json({ data: { target: "note", id: created.id } })
  }

  // target === "task"
  const { projectId, description } = parsed.data
  const project = await db.project.findFirst({
    where: {
      id: projectId,
      plan: { userId: session.user.id },
    },
    select: { id: true },
  })
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }
  const taskCount = await db.task.count({ where: { projectId: project.id } })
  if (taskCount >= limits.maxTasksPerProject) {
    return NextResponse.json(
      {
        error: "TASK_LIMIT",
        message: `Reached ${limits.maxTasksPerProject} tasks on this project.`,
      },
      { status: 402 },
    )
  }

  const created = await db.$transaction(async (tx) => {
    const task = await tx.task.create({
      data: {
        projectId: project.id,
        description: (description ?? drift.content).slice(0, 500),
        type: ActionType.SMALL,
        status: GoalStatus.NOT_STARTED,
      },
    })
    await tx.drift.update({
      where: { id: drift.id },
      data: {
        resolvedAt: new Date(),
        resolvedAs: "task",
        resolvedRef: task.id,
      },
    })
    return task
  })
  return NextResponse.json({ data: { target: "task", id: created.id } })
}
