import {
  sendDailyNudge,
  sendMonthlyPlan,
  sendMonthlyReview,
  sendQuarterlyPlan,
  sendQuarterlyReview,
  sendWeeklyPlan,
  sendWeeklyReview,
} from "@/lib/email"
import { runDailyNudgeCron } from "@/lib/cron/daily-nudge-rhythm"
import { runMonthlyRhythmCron } from "@/lib/cron/monthly-rhythm"
import { runQuarterlyRhythmCron } from "@/lib/cron/quarterly-rhythm"
import { runWeeklyRhythmCron } from "@/lib/cron/weekly-rhythm"
import { warnIfHighEmailVolume } from "@/lib/cron/email-monitoring"

export type HourlyRhythmCronResult = {
  ranAt: string
  totalSent: number
  weeklyPlan: Awaited<ReturnType<typeof runWeeklyRhythmCron>>
  weeklyReview: Awaited<ReturnType<typeof runWeeklyRhythmCron>>
  monthlyPlan: Awaited<ReturnType<typeof runMonthlyRhythmCron>>
  monthlyReview: Awaited<ReturnType<typeof runMonthlyRhythmCron>>
  quarterlyPlan: Awaited<ReturnType<typeof runQuarterlyRhythmCron>>
  quarterlyReview: Awaited<ReturnType<typeof runQuarterlyRhythmCron>>
  dailyNudge: Awaited<ReturnType<typeof runDailyNudgeCron>>
}

/**
 * Hourly rhythm dispatcher — each cadence only sends to users in their local
 * send window (Sunday 6 PM plan, Friday 5 PM review, etc.).
 */
export async function runHourlyRhythmCron(
  now: Date = new Date(),
): Promise<HourlyRhythmCronResult> {
  const weeklyPlan = await runWeeklyRhythmCron({
    kind: "plan",
    now,
    send: (email, weekNumber, name) =>
      sendWeeklyPlan(email, weekNumber, name),
  })

  const weeklyReview = await runWeeklyRhythmCron({
    kind: "review",
    now,
    send: (email, _weekNumber, name) => sendWeeklyReview(email, name),
  })

  const monthlyPlan = await runMonthlyRhythmCron({
    kind: "plan",
    now,
    send: (email, monthLabel, name) => sendMonthlyPlan(email, monthLabel, name),
  })

  const monthlyReview = await runMonthlyRhythmCron({
    kind: "review",
    now,
    send: (email, monthLabel, name) =>
      sendMonthlyReview(email, monthLabel, name),
  })

  const quarterlyPlan = await runQuarterlyRhythmCron({
    kind: "plan",
    now,
    send: (email, quarter, name) => sendQuarterlyPlan(email, quarter, name),
  })

  const quarterlyReview = await runQuarterlyRhythmCron({
    kind: "review",
    now,
    send: (email, quarter, name) => sendQuarterlyReview(email, quarter, name),
  })

  const dailyNudge = await runDailyNudgeCron({
    now,
    send: (email, name) => sendDailyNudge(email, name),
  })

  const totalSent =
    weeklyPlan.usersNotified +
    weeklyReview.usersNotified +
    monthlyPlan.usersNotified +
    monthlyReview.usersNotified +
    quarterlyPlan.usersNotified +
    quarterlyReview.usersNotified +
    dailyNudge.usersNotified

  warnIfHighEmailVolume("rhythm-hourly", totalSent)

  return {
    ranAt: now.toISOString(),
    totalSent,
    weeklyPlan,
    weeklyReview,
    monthlyPlan,
    monthlyReview,
    quarterlyPlan,
    quarterlyReview,
    dailyNudge,
  }
}
