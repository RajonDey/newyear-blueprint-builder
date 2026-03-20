import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const updateSchema = z.object({
  status: z
    .enum(["NOT_STARTED", "IN_PROGRESS", "ON_TRACK", "AT_RISK", "COMPLETED", "ABANDONED"])
    .optional(),
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(2000).optional().nullable(),
})

async function checkpointForUser(checkpointId: string, userId: string) {
  return db.checkpointGoal.findFirst({
    where: {
      id: checkpointId,
      goal: { plan: { userId } },
    },
  })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ checkpointId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { checkpointId } = await params
  const existing = await checkpointForUser(checkpointId, session.user.id)
  if (!existing) {
    return NextResponse.json({ error: "Checkpoint not found" }, { status: 404 })
  }

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const data = Object.fromEntries(
    Object.entries(parsed.data).filter(([, v]) => v !== undefined)
  )

  const checkpoint = await db.checkpointGoal.update({
    where: { id: checkpointId },
    data,
  })

  return NextResponse.json({ data: checkpoint })
}
