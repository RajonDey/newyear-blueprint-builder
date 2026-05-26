import { NextResponse } from "next/server"
import { z } from "zod"
import { Frequency } from "@prisma/client"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { planLimits } from "@/lib/config"

const createSchema = z.object({
  projectId: z.string().trim().min(1),
  description: z.string().trim().min(1).max(500),
  frequency: z.nativeEnum(Frequency).default(Frequency.DAILY),
})

/**
 * Top-level systems creation. Used by the `/systems` page's quick-add form.
 *
 * Per-project creation still lives at `/api/projects/[projectId]/systems` for the
 * project detail surface; both paths enforce the same `maxSystemsPerProject`
 * cap.
 */
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const body = await req.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const project = await db.project.findFirst({
    where: {
      id: parsed.data.projectId,
      plan: { userId: session.user.id },
    },
    select: { id: true },
  })
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  const limits = planLimits[session.user.planTier]
  const count = await db.system.count({
    where: { projectId: project.id },
  })
  if (count >= limits.maxSystemsPerProject) {
    return NextResponse.json(
      {
        error: "SYSTEM_LIMIT",
        message: `Reached ${limits.maxSystemsPerProject} systems on this project.`,
        upgradeUrl: "/pricing",
      },
      { status: 402 },
    )
  }

  const system = await db.system.create({
    data: {
      projectId: project.id,
      description: parsed.data.description,
      frequency: parsed.data.frequency,
    },
  })

  return NextResponse.json({ data: system }, { status: 201 })
}
