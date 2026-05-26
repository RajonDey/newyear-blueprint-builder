import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { shouldSendEmail } from "@/lib/cron/email-eligibility"
import { sendMonthlyNudge } from "@/lib/email"

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const monthLabel = MONTH_NAMES[month - 1] ?? `Month ${month}`

  const activePlans = await db.yearlyPlan.findMany({
    where: {
      status: "ACTIVE",
      user: { planTier: "PRO" },
    },
    include: {
      user: {
        select: { email: true, name: true, preferences: true },
      },
      monthlyReviews: {
        where: { month, year },
        take: 1,
      },
    },
  })

  const toNotify = activePlans.filter((plan) => plan.monthlyReviews.length === 0)
  const sent: string[] = []
  const skipped: string[] = []
  const errors: { email: string; error: string }[] = []

  for (const plan of toNotify) {
    if (
      !shouldSendEmail(plan.user.preferences, "monthlyNudge")
    ) {
      skipped.push(plan.user.email)
      continue
    }

    try {
      await sendMonthlyNudge(
        plan.user.email,
        monthLabel,
        plan.user.name ?? undefined,
      )
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
      month,
      year,
      usersNotified: sent.length,
      usersSkipped: skipped.length,
      sent,
      skipped: skipped.length > 0 ? skipped : undefined,
      errors: errors.length > 0 ? errors : undefined,
    },
  })
}
