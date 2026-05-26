import { NextResponse } from "next/server"
import { subDays } from "date-fns"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getYmdInTimeZone } from "@/lib/systems-period"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { timezone: true },
  })
  const timeZone = user?.timezone || "UTC"
  const todayYmd = getYmdInTimeZone(new Date(), timeZone)

  const plan = await db.yearlyPlan.findFirst({
    where: { userId: session.user.id, status: "ACTIVE" },
    select: {
      projects: {
        select: {
          systems: {
            where: { isActive: true },
            select: { id: true },
          },
        },
      },
    },
  })

  const activeSystemIds =
    plan?.projects.flatMap((g) => g.systems.map((s) => s.id)) ?? []
  const totalSystems = activeSystemIds.length

  if (totalSystems === 0) {
    return NextResponse.json({ data: { days: [], totalSystems: 0, today: todayYmd } })
  }

  const since = subDays(new Date(), 90)
  const completions = await db.systemCompletion.findMany({
    where: {
      systemId: { in: activeSystemIds },
      date: { gte: since },
    },
    select: { date: true },
  })

  const countByDay = new Map<string, number>()
  for (const c of completions) {
    const ymd = getYmdInTimeZone(c.date, timeZone)
    countByDay.set(ymd, (countByDay.get(ymd) ?? 0) + 1)
  }

  const days = Array.from(countByDay.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return NextResponse.json({
    data: { days, totalSystems, today: todayYmd },
  })
}
