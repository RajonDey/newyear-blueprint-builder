import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

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
    select: { id: true },
  })
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  const keyResults = await db.keyResult.findMany({
    where: { projectId },
    orderBy: { sortOrder: "asc" },
  })

  return NextResponse.json({ data: keyResults })
}

const createKeyResultSchema = z.object({
  title: z.string().min(1).max(500),
  targetValue: z.number().positive(),
  currentValue: z.number().min(0).default(0),
  unit: z.string().max(50).default(""),
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
    select: { id: true },
  })
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  const body = await req.json()
  const parsed = createKeyResultSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const count = await db.keyResult.count({ where: { projectId } })
  if (count >= 5) {
    return NextResponse.json(
      { error: "Maximum 5 key results per project" },
      { status: 400 }
    )
  }

  const keyResult = await db.keyResult.create({
    data: {
      projectId,
      title: parsed.data.title.trim(),
      targetValue: parsed.data.targetValue,
      currentValue: parsed.data.currentValue,
      unit: parsed.data.unit.trim(),
      sortOrder: count,
    },
  })

  return NextResponse.json({ data: keyResult }, { status: 201 })
}
