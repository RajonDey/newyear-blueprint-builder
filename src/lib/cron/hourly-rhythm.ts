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
import { dailyRhythmWindowSince } from "@/lib/cron/timezone-window"

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

export type DailyRhythmCronResult = HourlyRhythmCronResult & {
  mode: "daily-batch"
  windowSince: string
}

type RunRhythmDispatchInput = {
  now?: Date
  windowSince?: Date
  volumeLabel: "rhythm-hourly" | "rhythm-daily"
}

async function runRhythmDispatch({
  now = new Date(),
  windowSince,
  volumeLabel,
}: RunRhythmDispatchInput): Promise<HourlyRhythmCronResult> {
  const dispatchOpts = { now, windowSince }

  const weeklyPlan = await runWeeklyRhythmCron({
    kind: "plan",
    ...dispatchOpts,
    send: (email, weekNumber, name) =>
      sendWeeklyPlan(email, weekNumber, name),
  })

  const weeklyReview = await runWeeklyRhythmCron({
    kind: "review",
    ...dispatchOpts,
    send: (email, _weekNumber, name) => sendWeeklyReview(email, name),
  })

  const monthlyPlan = await runMonthlyRhythmCron({
    kind: "plan",
    ...dispatchOpts,
    send: (email, monthLabel, name) => sendMonthlyPlan(email, monthLabel, name),
  })

  const monthlyReview = await runMonthlyRhythmCron({
    kind: "review",
    ...dispatchOpts,
    send: (email, monthLabel, name) =>
      sendMonthlyReview(email, monthLabel, name),
  })

  const quarterlyPlan = await runQuarterlyRhythmCron({
    kind: "plan",
    ...dispatchOpts,
    send: (email, quarter, name) => sendQuarterlyPlan(email, quarter, name),
  })

  const quarterlyReview = await runQuarterlyRhythmCron({
    kind: "review",
    ...dispatchOpts,
    send: (email, quarter, name) => sendQuarterlyReview(email, quarter, name),
  })

  const dailyNudge = await runDailyNudgeCron({
    ...dispatchOpts,
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

  warnIfHighEmailVolume(volumeLabel, totalSent)

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

/**
 * Hourly rhythm dispatcher — each cadence only sends to users in their local
 * send window (Sunday 6 PM plan, Friday 5 PM review, etc.).
 * Use on Vercel Pro or an external hourly cron trigger.
 */
export async function runHourlyRhythmCron(
  now: Date = new Date(),
): Promise<HourlyRhythmCronResult> {
  return runRhythmDispatch({ now, volumeLabel: "rhythm-hourly" })
}

/**
 * Daily rhythm dispatcher for Vercel Hobby — replays the last ~27 UTC hours
 * so every timezone send window is covered once per day without hourly crons.
 */
export async function runDailyRhythmCron(
  now: Date = new Date(),
): Promise<DailyRhythmCronResult> {
  const windowSince = dailyRhythmWindowSince(now)
  const data = await runRhythmDispatch({
    now,
    windowSince,
    volumeLabel: "rhythm-daily",
  })

  return {
    ...data,
    mode: "daily-batch",
    windowSince: windowSince.toISOString(),
  }
}
