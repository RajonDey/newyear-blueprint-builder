import { db } from "@/lib/db"
import { monthLabel } from "@/lib/cron/cadence-labels"
import {
  cronSendDelayMs,
  sendRhythmEmailIfEligible,
  sleep,
} from "@/lib/cron/send-rhythm-email"
import {
  getLocalMonth,
  getLocalYear,
  isInLocalSendWindowForCron,
  normalizeTimeZone,
  RHYTHM_SEND_WINDOWS,
  type RhythmSendWindow,
} from "@/lib/cron/timezone-window"

export type MonthlyRhythmKind = "plan" | "review"

export type MonthlyRhythmCronResult = {
  kind: MonthlyRhythmKind
  month: number
  year: number
  monthLabel: string
  usersNotified: number
  usersSkipped: number
  usersSkippedDedupe: number
  usersSkippedTimezone: number
  sent: string[]
  skipped?: string[]
  skippedDedupe?: string[]
  errors?: { email: string; error: string }[]
}

type RunMonthlyRhythmCronInput = {
  kind: MonthlyRhythmKind
  send: (email: string, monthLabel: string, name?: string) => Promise<unknown>
  now?: Date
  requireTimezoneWindow?: boolean
  windowSince?: Date
}

function monthlyWindow(kind: MonthlyRhythmKind): RhythmSendWindow {
  return kind === "plan"
    ? RHYTHM_SEND_WINDOWS.monthlyPlan
    : RHYTHM_SEND_WINDOWS.monthlyReview
}

/**
 * Pro-only monthly plan (no MonthlyPlan) and review (no MonthlyReview).
 * Both respect the combined `monthlyNudge` preference.
 */
export async function runMonthlyRhythmCron({
  kind,
  send,
  now = new Date(),
  requireTimezoneWindow = true,
  windowSince,
}: RunMonthlyRhythmCronInput): Promise<MonthlyRhythmCronResult> {
  const window = monthlyWindow(kind)

  const activePlans = await db.yearlyPlan.findMany({
    where: {
      status: "ACTIVE",
      user: { planTier: "PRO" },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          preferences: true,
          timezone: true,
        },
      },
      monthlyPlans: true,
      monthlyReviews: true,
    },
  })

  const sent: string[] = []
  const skippedPreference: string[] = []
  const skippedDedupe: string[] = []
  const skippedTimezone: string[] = []
  const errors: { email: string; error: string }[] = []
  const delayMs = cronSendDelayMs()

  let sampleMonth = 1
  let sampleYear = now.getUTCFullYear()

  for (const plan of activePlans) {
    const timeZone = normalizeTimeZone(plan.user.timezone)

    if (
      requireTimezoneWindow &&
      !isInLocalSendWindowForCron(now, timeZone, window, windowSince)
    ) {
      skippedTimezone.push(plan.user.email)
      continue
    }

    const month = getLocalMonth(now, timeZone)
    const year = getLocalYear(now, timeZone)
    sampleMonth = month
    sampleYear = year
    const label = monthLabel(month)

    const hasCadenceRow =
      kind === "plan"
        ? plan.monthlyPlans.some((row) => row.month === month && row.year === year)
        : plan.monthlyReviews.some(
            (row) => row.month === month && row.year === year,
          )

    if (hasCadenceRow) continue

    const result = await sendRhythmEmailIfEligible({
      userId: plan.user.id,
      email: plan.user.email,
      preferences: plan.user.preferences,
      preferenceKey: "monthlyNudge",
      timeZone,
      now,
      send: () => send(plan.user.email, label, plan.user.name ?? undefined),
    })

    if (result.status === "sent") {
      sent.push(plan.user.email)
      if (delayMs > 0) await sleep(delayMs)
    } else if (result.status === "skipped" && result.reason === "preference") {
      skippedPreference.push(plan.user.email)
    } else if (result.status === "skipped" && result.reason === "dedupe") {
      skippedDedupe.push(plan.user.email)
    } else if (result.status === "error") {
      errors.push({ email: plan.user.email, error: result.message })
    }
  }

  return {
    kind,
    month: sampleMonth,
    year: sampleYear,
    monthLabel: monthLabel(sampleMonth),
    usersNotified: sent.length,
    usersSkipped: skippedPreference.length,
    usersSkippedDedupe: skippedDedupe.length,
    usersSkippedTimezone: skippedTimezone.length,
    sent,
    skipped: skippedPreference.length > 0 ? skippedPreference : undefined,
    skippedDedupe: skippedDedupe.length > 0 ? skippedDedupe : undefined,
    errors: errors.length > 0 ? errors : undefined,
  }
}
