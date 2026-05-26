import { NextResponse } from "next/server"
import { z } from "zod"
import { Quarter } from "@prisma/client"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

/**
 * Quarterly checkpoints scoped to a single project.
 *
 * `ProjectCheckpoint` has no unique constraint on `(projectId, quarter)` so
 * multiple checkpoints per quarter are allowed (some users plan one
 * milestone per quarter, others several). We don't auto-seed Q1-Q4 on
 * project creation — users add the ones that matter as they plan.
 *
 * POST creates one; the matching DELETE / PATCH live at
 * `/api/checkpoints/[checkpointId]`.
 */
const createSchema = z.object({
  quarter: z.nativeEnum(Quarter),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  targetDate: z.union([z.string().datetime(), z.null()]).optional(),
})

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

  const targetDate =
    parsed.data.targetDate === undefined || parsed.data.targetDate === null
      ? null
      : new Date(parsed.data.targetDate)

  const checkpoint = await db.projectCheckpoint.create({
    data: {
      projectId,
      quarter: parsed.data.quarter,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      targetDate,
    },
  })

  return NextResponse.json({ data: checkpoint }, { status: 201 })
}
