import { db } from "@/lib/db"
import {
  cronSendDelayMs,
  sendRhythmEmailIfEligible,
  sleep,
} from "@/lib/cron/send-rhythm-email"
import {
  isInLocalSendWindowForCron,
  normalizeTimeZone,
  RHYTHM_SEND_WINDOWS,
  type RhythmSendWindow,
} from "@/lib/cron/timezone-window"
import { getIsoWeekContextInTimeZone } from "@/lib/utils"

export type WeeklyRhythmKind = "plan" | "review"

export type WeeklyRhythmCronResult = {
  kind: WeeklyRhythmKind
  weekNumber: number
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

type RunWeeklyRhythmCronInput = {
  kind: WeeklyRhythmKind
  send: (email: string, weekNumber: number, name?: string) => Promise<unknown>
  now?: Date
  /** When true, only users in the local send window receive email. */
  requireTimezoneWindow?: boolean
  /** Daily batch: match if the window occurred since this instant. */
  windowSince?: Date
}

function weeklyWindow(kind: WeeklyRhythmKind): RhythmSendWindow {
  return kind === "plan"
    ? RHYTHM_SEND_WINDOWS.weeklyPlan
    : RHYTHM_SEND_WINDOWS.weeklyReview
}

/**
 * Shared loop for weekly plan (no WeeklyPlan row) and review (no WeeklyCheckIn row).
 * Both respect the combined `weeklyReviewReminder` preference.
 */
export async function runWeeklyRhythmCron({
  kind,
  send,
  now = new Date(),
  requireTimezoneWindow = true,
  windowSince,
}: RunWeeklyRhythmCronInput): Promise<WeeklyRhythmCronResult> {
  const window = weeklyWindow(kind)

  const activePlans = await db.yearlyPlan.findMany({
    where: { status: "ACTIVE" },
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
      weeklyPlans: true,
      weeklyCheckIns: true,
    },
  })

  const sent: string[] = []
  const skippedPreference: string[] = []
  const skippedDedupe: string[] = []
  const skippedTimezone: string[] = []
  const errors: { email: string; error: string }[] = []
  const delayMs = cronSendDelayMs()

  let sampleWeek = { weekNumber: 0, year: 0 }

  for (const plan of activePlans) {
    const timeZone = normalizeTimeZone(plan.user.timezone)

    if (
      requireTimezoneWindow &&
      !isInLocalSendWindowForCron(now, timeZone, window, windowSince)
    ) {
      skippedTimezone.push(plan.user.email)
      continue
    }

    const { weekNumber, year } = getIsoWeekContextInTimeZone(now, timeZone)
    if (sampleWeek.weekNumber === 0) sampleWeek = { weekNumber, year }

    const hasCadenceRow =
      kind === "plan"
        ? plan.weeklyPlans.some(
            (row) => row.weekNumber === weekNumber && row.year === year,
          )
        : plan.weeklyCheckIns.some(
            (row) => row.weekNumber === weekNumber && row.year === year,
          )

    if (hasCadenceRow) continue

    const result = await sendRhythmEmailIfEligible({
      userId: plan.user.id,
      email: plan.user.email,
      preferences: plan.user.preferences,
      preferenceKey: "weeklyReviewReminder",
      timeZone,
      now,
      send: () =>
        send(plan.user.email, weekNumber, plan.user.name ?? undefined),
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
    weekNumber: sampleWeek.weekNumber,
    year: sampleWeek.year,
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

export { verifyCronSecret } from "@/lib/cron/cron-auth"
