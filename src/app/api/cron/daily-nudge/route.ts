import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { shouldSendEmail } from "@/lib/cron/email-eligibility"
import { sendDailyNudge } from "@/lib/email"

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Find users whose "DAILY_SYSTEM" streak lastCompletedAt was exactly 2 days ago (between 48 and 72 hours ago)
  const now = Date.now()
  const twoDaysAgo = new Date(now - 48 * 60 * 60 * 1000)
  const threeDaysAgo = new Date(now - 72 * 60 * 60 * 1000)

  const droppedOffStreaks = await db.streak.findMany({
    where: {
      type: "DAILY_SYSTEM",
      lastCompletedAt: {
        lt: twoDaysAgo,
        gte: threeDaysAgo,
      },
      user: {
        yearlyPlans: {
          some: {
            status: "ACTIVE",
          },
        },
      },
    },
    include: {
      user: { select: { email: true, name: true, preferences: true } },
    },
  })

  const sent: string[] = []
  const skipped: string[] = []
  const errors: { email: string; error: string }[] = []

  for (const streak of droppedOffStreaks) {
    if (!streak.user?.email) continue
    if (!shouldSendEmail(streak.user.preferences, "dailyNudge")) {
      skipped.push(streak.user.email)
      continue
    }
    try {
      await sendDailyNudge(streak.user.email, streak.user.name ?? undefined)
      sent.push(streak.user.email)
    } catch (e) {
      errors.push({
        email: streak.user.email,
        error: e instanceof Error ? e.message : "Unknown error",
      })
    }
  }

  return NextResponse.json({
    data: {
      usersNotified: sent.length,
      usersSkipped: skipped.length,
      sent,
      skipped: skipped.length > 0 ? skipped : undefined,
      errors: errors.length > 0 ? errors : undefined,
    },
  })
}
