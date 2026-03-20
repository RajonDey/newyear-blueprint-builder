import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getPlanById } from "@/lib/queries/plans"
import { db } from "@/lib/db"
import { z } from "zod"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { planId } = await params
  const plan = await getPlanById(planId, session.user.id)
  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 })
  }

  return NextResponse.json({ data: plan })
}

const updatePlanSchema = z.object({
  status: z.enum(["DRAFT", "ACTIVE", "COMPLETED", "ARCHIVED"]).optional(),
  reflections: z.record(z.string(), z.string()).optional(),
})

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { planId } = await params
  const existing = await db.yearlyPlan.findFirst({
    where: { id: planId, userId: session.user.id },
  })
  if (!existing) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 })
  }

  const body = await req.json()
  const parsed = updatePlanSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  if (parsed.data.status === "ACTIVE") {
    await db.yearlyPlan.updateMany({
      where: { userId: session.user.id, status: "ACTIVE", id: { not: planId } },
      data: { status: "ARCHIVED" },
    })
  }

  const plan = await db.yearlyPlan.update({
    where: { id: planId },
    data: parsed.data,
  })

  return NextResponse.json({ data: plan })
}
