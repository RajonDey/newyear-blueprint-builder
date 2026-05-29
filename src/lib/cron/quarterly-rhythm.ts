import type { Quarter } from "@prisma/client"
import { db } from "@/lib/db"
import {
  getLocalYear,
  getQuarterInTimeZone,
  isInLocalSendWindowForCron,
  normalizeTimeZone,
  RHYTHM_SEND_WINDOWS,
  type RhythmSendWindow,
} from "@/lib/cron/timezone-window"
import type { QuarterLabel } from "@/lib/cron/cadence-labels"
import {
  cronSendDelayMs,
  sendRhythmEmailIfEligible,
  sleep,
} from "@/lib/cron/send-rhythm-email"

export type QuarterlyRhythmKind = "plan" | "review"

export type QuarterlyRhythmCronResult = {
  kind: QuarterlyRhythmKind
  quarter: QuarterLabel
  year: number
  usersNotified: number
  usersSkipped: number
  usersSkippedDedupe: number
  usersSkippedTimezone: number
  sent: string[]
  skipped?: string[]
  skippedDedupe?: string[]
  errors?: { email: string; error: string }[]
}

type RunQuarterlyRhythmCronInput = {
  kind: QuarterlyRhythmKind
  send: (email: string, quarter: QuarterLabel, name?: string) => Promise<unknown>
  now?: Date
  requireTimezoneWindow?: boolean
  windowSince?: Date
}

function quarterlyWindow(kind: QuarterlyRhythmKind): RhythmSendWindow {
  return kind === "plan"
    ? RHYTHM_SEND_WINDOWS.quarterlyPlan
    : RHYTHM_SEND_WINDOWS.quarterlyReview
}

/**
 * Pro-only quarterly plan (no QuarterlyPlan) and review (no QuarterlyReview).
 * Both respect the combined `quarterlyNudge` preference.
 */
export async function runQuarterlyRhythmCron({
  kind,
  send,
  now = new Date(),
  requireTimezoneWindow = true,
  windowSince,
}: RunQuarterlyRhythmCronInput): Promise<QuarterlyRhythmCronResult> {
  const window = quarterlyWindow(kind)

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
      quarterlyPlans: true,
      quarterlyReviews: true,
    },
  })

  const sent: string[] = []
  const skippedPreference: string[] = []
  const skippedDedupe: string[] = []
  const skippedTimezone: string[] = []
  const errors: { email: string; error: string }[] = []
  const delayMs = cronSendDelayMs()

  let sampleQuarter: QuarterLabel = "Q1"
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

    const quarter = getQuarterInTimeZone(now, timeZone)
    const year = getLocalYear(now, timeZone)
    sampleQuarter = quarter
    sampleYear = year

    const hasCadenceRow =
      kind === "plan"
        ? plan.quarterlyPlans.some(
            (row) => row.quarter === (quarter as Quarter) && row.year === year,
          )
        : plan.quarterlyReviews.some(
            (row) => row.quarter === (quarter as Quarter),
          )

    if (hasCadenceRow) continue

    const result = await sendRhythmEmailIfEligible({
      userId: plan.user.id,
      email: plan.user.email,
      preferences: plan.user.preferences,
      preferenceKey: "quarterlyNudge",
      timeZone,
      now,
      send: () => send(plan.user.email, quarter, plan.user.name ?? undefined),
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
    quarter: sampleQuarter,
    year: sampleYear,
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
