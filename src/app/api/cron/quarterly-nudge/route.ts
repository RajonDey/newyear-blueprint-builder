import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { shouldSendEmail } from "@/lib/cron/email-eligibility"
import { sendQuarterlyNudge } from "@/lib/email"

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"] as const

function getCurrentQuarter(): (typeof QUARTERS)[number] {
  const month = new Date().getMonth()
  if (month < 3) return "Q1"
  if (month < 6) return "Q2"
  if (month < 9) return "Q3"
  return "Q4"
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const quarter = getCurrentQuarter()
  const year = new Date().getFullYear()

  const activePlans = await db.yearlyPlan.findMany({
    where: {
      status: "ACTIVE",
      year,
      user: { planTier: "PRO" },
    },
    include: {
      user: {
        select: { email: true, name: true, preferences: true },
      },
      quarterlyReviews: {
        where: { quarter },
        take: 1,
      },
    },
  })

  const toNotify = activePlans.filter((plan) => plan.quarterlyReviews.length === 0)
  const sent: string[] = []
  const skipped: string[] = []
  const errors: { email: string; error: string }[] = []

  for (const plan of toNotify) {
    if (!shouldSendEmail(plan.user.preferences, "quarterlyNudge")) {
      skipped.push(plan.user.email)
      continue
    }

    try {
      await sendQuarterlyNudge(plan.user.email, quarter, plan.user.name ?? undefined)
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
      quarter,
      year,
      usersNotified: sent.length,
      usersSkipped: skipped.length,
      sent,
      skipped: skipped.length > 0 ? skipped : undefined,
      errors: errors.length > 0 ? errors : undefined,
    },
  })
}
