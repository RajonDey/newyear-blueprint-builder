import { NextResponse } from "next/server"
import { z } from "zod"
import { ActionType, GoalStatus } from "@prisma/client"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

const patchSchema = z.object({
  description: z.string().trim().min(1).max(500).optional(),
  type: z.nativeEnum(ActionType).optional(),
  status: z.nativeEnum(GoalStatus).optional(),
  /** Tap-to-toggle convenience: `done=true` → COMPLETED, `done=false` → NOT_STARTED. */
  done: z.boolean().optional(),
  targetDate: z.union([z.string().datetime(), z.null()]).optional(),
  /**
   * Move this task to a different project. The target project must belong
   * to the same user (verified below before the update is applied).
   */
  projectId: z.string().trim().min(1).optional(),
})

async function taskForUser(taskId: string, userId: string) {
  return db.task.findFirst({
    where: { id: taskId, project: { plan: { userId } } },
  })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { taskId } = await params
  const existing = await taskForUser(taskId, session.user.id)
  if (!existing) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  const body = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const status =
    parsed.data.status ??
    (parsed.data.done === undefined
      ? undefined
      : parsed.data.done
        ? GoalStatus.COMPLETED
        : GoalStatus.NOT_STARTED)

  const targetDate =
    parsed.data.targetDate === undefined
      ? undefined
      : parsed.data.targetDate === null
        ? null
        : new Date(parsed.data.targetDate)

  let projectIdUpdate: string | undefined = undefined
  if (parsed.data.projectId && parsed.data.projectId !== existing.projectId) {
    const targetProject = await db.project.findFirst({
      where: {
        id: parsed.data.projectId,
        plan: { userId: session.user.id },
      },
      select: { id: true },
    })
    if (!targetProject) {
      return NextResponse.json(
        { error: "Target project not found" },
        { status: 404 },
      )
    }
    projectIdUpdate = targetProject.id
  }

  const task = await db.task.update({
    where: { id: taskId },
    data: {
      description: parsed.data.description,
      type: parsed.data.type,
      status,
      targetDate,
      projectId: projectIdUpdate,
    },
  })

  return NextResponse.json({ data: task })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { taskId } = await params
  const existing = await taskForUser(taskId, session.user.id)
  if (!existing) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }
  await db.task.delete({ where: { id: taskId } })
  return NextResponse.json({ ok: true })
}
