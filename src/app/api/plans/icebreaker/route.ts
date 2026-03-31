import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const icebreakerSchema = z.object({
  year: z.number().int().min(2023),
  wheelEntries: z.array(
    z.object({
      category: z.enum([
        "HEALTH",
        "CAREER",
        "FINANCE",
        "RELATIONSHIPS",
        "SPIRITUALITY",
        "PASSION",
      ]),
      rating: z.number().min(1).max(10),
    })
  ).length(6),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = icebreakerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { year, wheelEntries } = parsed.data
  const userId = session.user.id

  const existingPlan = await db.yearlyPlan.findUnique({
    where: { userId_year: { userId, year } },
  })

  // Do not allow creating an icebreaker if they already have *any* plan
  if (existingPlan) {
    return NextResponse.json(
      { error: "A plan already exists for this year." },
      { status: 409 }
    )
  }

  const plan = await db.$transaction(async (tx) => {
    // Archiving previous active plans to avoid multiple active plans overlapping
    await tx.yearlyPlan.updateMany({
      where: { userId, status: "ACTIVE" },
      data: { status: "ARCHIVED" },
    })

    const newPlan = await tx.yearlyPlan.create({
      data: {
        userId,
        year,
        status: "ACTIVE",
      },
    })

    await tx.wheelOfLifeEntry.createMany({
      data: wheelEntries.map((entry) => ({
        planId: newPlan.id,
        category: entry.category,
        rating: entry.rating,
      })),
    })

    return newPlan
  })

  return NextResponse.json({ data: plan }, { status: 201 })
}
