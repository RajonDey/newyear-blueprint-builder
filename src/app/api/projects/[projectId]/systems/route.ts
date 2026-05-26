import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { planLimits } from "@/lib/config"
import { z } from "zod"

const createSchema = z.object({
  description: z.string().min(1).max(500).trim(),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId: projectId } = await params
  const project = await db.project.findFirst({
    where: { id: projectId, plan: { userId: session.user.id } },
    select: { id: true, planId: true },
  })
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const limits = planLimits[session.user.planTier]
  const count = await db.system.count({ where: { projectId } })
  if (count >= limits.maxSystemsPerProject) {
    return NextResponse.json(
      {
        error: `You can add up to ${limits.maxSystemsPerProject} systems per project on your plan.`,
      },
      { status: 403 }
    )
  }

  const system = await db.system.create({
    data: {
      projectId,
      description: parsed.data.description,
      frequency: parsed.data.frequency,
    },
  })

  return NextResponse.json({ data: system }, { status: 201 })
}
