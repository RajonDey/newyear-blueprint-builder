import { NextResponse } from "next/server"
import { z } from "zod"
import { ActionType, GoalStatus } from "@prisma/client"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { planLimits } from "@/lib/config"

const createSchema = z.object({
  description: z.string().trim().min(1).max(500),
  type: z.nativeEnum(ActionType).default("SMALL"),
  targetDate: z.string().datetime().nullish(),
})

/**
 * Tasks scoped to a single project.
 *
 * GET   /api/projects/[projectId]/tasks   — list (used by detail page; rarely needed since
 *                                     server components fetch via `lib/queries/projects`).
 * POST  /api/projects/[projectId]/tasks   — create one, enforces `maxTasksPerProject` cap.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { projectId: projectId } = await params
  const project = await db.project.findFirst({
    where: { id: projectId, plan: { userId: session.user.id } },
    select: { id: true },
  })
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }
  const tasks = await db.task.findMany({
    where: { projectId },
    orderBy: [{ status: "asc" }, { targetDate: "asc" }, { type: "asc" }],
  })
  return NextResponse.json({ data: tasks })
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { projectId: projectId } = await params
  const project = await db.project.findFirst({
    where: { id: projectId, plan: { userId: session.user.id } },
    select: { id: true },
  })
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  const body = await req.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const limits = planLimits[session.user.planTier]
  const count = await db.task.count({ where: { projectId } })
  if (count >= limits.maxTasksPerProject) {
    return NextResponse.json(
      {
        error: "TASK_LIMIT",
        message: `Reached ${limits.maxTasksPerProject} tasks on this project.`,
        upgradeUrl: "/pricing",
      },
      { status: 402 },
    )
  }

  const task = await db.task.create({
    data: {
      projectId,
      description: parsed.data.description,
      type: parsed.data.type,
      status: GoalStatus.NOT_STARTED,
      targetDate: parsed.data.targetDate
        ? new Date(parsed.data.targetDate)
        : null,
    },
  })

  return NextResponse.json({ data: task }, { status: 201 })
}
