import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getIsoWeekContext, getPreviousIsoWeekContext } from "@/lib/utils"

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()

  // Only evaluate missed weeks at the start of a new ISO week (Monday UTC).
  if (now.getUTCDay() !== 1) {
    return NextResponse.json({
      data: { streaksProcessed: 0, streaksReset: 0, skipped: "not_monday" },
    })
  }

  const { weekNumber, year } = getIsoWeekContext(now)
  const { weekNumber: prevWeek, year: prevYear } = getPreviousIsoWeekContext(
    weekNumber,
    year,
  )

  const streaks = await db.streak.findMany({
    where: { type: "WEEKLY_CHECK_IN" },
  })

  let updated = 0

  for (const streak of streaks) {
    if (streak.currentStreak === 0) continue

    const plans = await db.yearlyPlan.findMany({
      where: { userId: streak.userId },
      select: { id: true },
    })
    const planIds = plans.map((p) => p.id)
    const checkedInPrevWeek = await db.weeklyCheckIn.findFirst({
      where: {
        planId: { in: planIds },
        weekNumber: prevWeek,
        year: prevYear,
      },
    })

    if (checkedInPrevWeek) {
      continue
    }

    await db.streak.update({
      where: { userId_type: { userId: streak.userId, type: "WEEKLY_CHECK_IN" } },
      data: {
        currentStreak: 0,
        lastCompletedAt: null,
      },
    })
    updated++
  }

  return NextResponse.json({
    data: { streaksProcessed: streaks.length, streaksReset: updated },
  })
}
