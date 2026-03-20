import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const createWheelEntrySchema = z.object({
  planId: z.string().min(1),
  entries: z.array(
    z.object({
      category: z.enum(["HEALTH", "CAREER", "FINANCE", "RELATIONSHIPS", "SPIRITUALITY", "PASSION"]),
      rating: z.number().int().min(1).max(10),
    })
  ),
  context: z.string().optional(),
})

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const planId = searchParams.get("planId")

  const entries = await db.wheelOfLifeEntry.findMany({
    where: {
      plan: { userId: session.user.id },
      ...(planId ? { planId } : {}),
    },
    orderBy: { recordedAt: "asc" },
  })

  return NextResponse.json({ data: entries })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = createWheelEntrySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const plan = await db.yearlyPlan.findFirst({
    where: { id: parsed.data.planId, userId: session.user.id },
  })
  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 })
  }

  const entries = await db.$transaction(
    parsed.data.entries.map((entry) =>
      db.wheelOfLifeEntry.create({
        data: {
          planId: parsed.data.planId,
          category: entry.category,
          rating: entry.rating,
          context: parsed.data.context,
        },
      })
    )
  )

  return NextResponse.json({ data: entries }, { status: 201 })
}
