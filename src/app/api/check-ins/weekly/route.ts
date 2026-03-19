import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"
import { getWeekNumber } from "@/lib/utils"

const createCheckInSchema = z.object({
  planId: z.string().min(1),
  overallMood: z.number().int().min(1).max(5).optional(),
  notes: z.string().max(2000).optional(),
  goalCheckIns: z.array(
    z.object({
      goalId: z.string().min(1),
      progressRating: z.number().int().min(1).max(5),
      notes: z.string().max(1000).optional(),
      blockers: z.string().max(1000).optional(),
    })
  ),
})

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const planId = searchParams.get("planId")
  const limit = parseInt(searchParams.get("limit") || "10")

  const checkIns = await db.weeklyCheckIn.findMany({
    where: {
      plan: { userId: session.user.id },
      ...(planId ? { planId } : {}),
    },
    include: { goalCheckIns: true },
    orderBy: { completedAt: "desc" },
    take: limit,
  })

  return NextResponse.json({ data: checkIns })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = createCheckInSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const now = new Date()
  const weekNumber = getWeekNumber(now)
  const year = now.getFullYear()

  const checkIn = await db.weeklyCheckIn.create({
    data: {
      planId: parsed.data.planId,
      weekNumber,
      year,
      overallMood: parsed.data.overallMood,
      notes: parsed.data.notes,
      goalCheckIns: {
        create: parsed.data.goalCheckIns,
      },
    },
    include: { goalCheckIns: true },
  })

  return NextResponse.json({ data: checkIn }, { status: 201 })
}
