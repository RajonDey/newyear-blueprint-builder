import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getWeekNumber } from "@/lib/utils"

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const weekNumber = getWeekNumber(now)
  const year = now.getFullYear()

  const streaks = await db.streak.findMany({
    where: { type: "WEEKLY_CHECK_IN" },
  })

  let updated = 0

  for (const streak of streaks) {
    const plans = await db.yearlyPlan.findMany({
      where: { userId: streak.userId },
      select: { id: true },
    })
    const planIds = plans.map((p) => p.id)
    const checkedInThisWeek = await db.weeklyCheckIn.findFirst({
      where: {
        planId: { in: planIds },
        weekNumber,
        year,
      },
    })

    if (checkedInThisWeek) {
      continue
    }

    const newCurrent = 0
    await db.streak.update({
      where: { userId_type: { userId: streak.userId, type: "WEEKLY_CHECK_IN" } },
      data: {
        currentStreak: newCurrent,
        lastCompletedAt: null,
      },
    })
    updated++
  }

  return NextResponse.json({
    data: { streaksProcessed: streaks.length, streaksReset: updated },
  })
}
