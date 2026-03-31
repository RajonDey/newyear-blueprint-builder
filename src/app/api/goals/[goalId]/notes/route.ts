import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ goalId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { goalId } = await params
  const goal = await db.goal.findFirst({
    where: { id: goalId, plan: { userId: session.user.id } },
    select: { id: true },
  })
  if (!goal) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 })
  }

  const notes = await db.goalNote.findMany({
    where: { goalId },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return NextResponse.json({ data: notes })
}

const createNoteSchema = z.object({
  content: z.string().min(1).max(5000),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ goalId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { goalId } = await params
  const goal = await db.goal.findFirst({
    where: { id: goalId, plan: { userId: session.user.id } },
    select: { id: true },
  })
  if (!goal) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 })
  }

  const body = await req.json()
  const parsed = createNoteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const note = await db.goalNote.create({
    data: { goalId, content: parsed.data.content.trim() },
  })

  return NextResponse.json({ data: note }, { status: 201 })
}
