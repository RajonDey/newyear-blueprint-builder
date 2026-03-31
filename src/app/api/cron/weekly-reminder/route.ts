import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getIsoWeekContext } from "@/lib/utils"
import { sendWeeklyReminder } from "@/lib/email"

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const { weekNumber, year } = getIsoWeekContext(now)

  const activePlans = await db.yearlyPlan.findMany({
    where: { status: "ACTIVE" },
    include: {
      user: { select: { id: true, email: true, name: true } },
      weeklyCheckIns: {
        where: { weekNumber, year },
        take: 1,
      },
    },
  })

  const toNotify = activePlans.filter((p) => p.weeklyCheckIns.length === 0)
  const sent: string[] = []
  const errors: { email: string; error: string }[] = []

  for (const plan of toNotify) {
    try {
      await sendWeeklyReminder(plan.user.email, plan.user.name ?? undefined)
      sent.push(plan.user.email)
    } catch (e) {
      errors.push({
        email: plan.user.email,
        error: e instanceof Error ? e.message : "Unknown error",
      })
    }
  }

  return NextResponse.json({
    data: {
      usersNotified: sent.length,
      sent,
      errors: errors.length > 0 ? errors : undefined,
    },
  })
}
