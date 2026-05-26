import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"
import { planLimits } from "@/lib/config"

const updateSchema = z.object({
  description: z.string().min(1).max(500).trim().optional(),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY"]).optional(),
  isActive: z.boolean().optional(),
  /**
   * Move this system to a different project. The target project must belong
   * to the same user (verified below before the update is applied).
   */
  projectId: z.string().trim().min(1).optional(),
})

async function systemForUser(systemId: string, userId: string) {
  return db.system.findFirst({
    where: {
      id: systemId,
      project: { plan: { userId } },
    },
  })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ systemId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { systemId } = await params
  const existing = await systemForUser(systemId, session.user.id)
  if (!existing) {
    return NextResponse.json({ error: "System not found" }, { status: 404 })
  }

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  let projectIdUpdate: string | undefined = undefined
  if (parsed.data.projectId && parsed.data.projectId !== existing.projectId) {
    const targetProject = await db.project.findFirst({
      where: {
        id: parsed.data.projectId,
        plan: { userId: session.user.id },
      },
      select: { id: true, _count: { select: { systems: true } } },
    })
    if (!targetProject) {
      return NextResponse.json(
        { error: "Target project not found" },
        { status: 404 },
      )
    }
    // Enforce per-project systems cap so moves don't quietly bypass plan limits.
    const limits = planLimits[session.user.planTier]
    if (targetProject._count.systems >= limits.maxSystemsPerProject) {
      return NextResponse.json(
        {
          error: "SYSTEM_LIMIT",
          message: `Target project is at the ${limits.maxSystemsPerProject}-system cap.`,
        },
        { status: 402 },
      )
    }
    projectIdUpdate = targetProject.id
  }

  const system = await db.system.update({
    where: { id: systemId },
    data: {
      description: parsed.data.description,
      frequency: parsed.data.frequency,
      isActive: parsed.data.isActive,
      projectId: projectIdUpdate,
    },
  })

  return NextResponse.json({ data: system })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ systemId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { systemId } = await params
  const existing = await systemForUser(systemId, session.user.id)
  if (!existing) {
    return NextResponse.json({ error: "System not found" }, { status: 404 })
  }

  await db.system.delete({ where: { id: systemId } })

  return NextResponse.json({ data: { deleted: true } })
}
