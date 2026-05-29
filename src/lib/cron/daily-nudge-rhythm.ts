import { db } from "@/lib/db"
import {
  cronSendDelayMs,
  sendRhythmEmailIfEligible,
  sleep,
} from "@/lib/cron/send-rhythm-email"
import {
  isInLocalSendWindow,
  normalizeTimeZone,
  RHYTHM_SEND_WINDOWS,
} from "@/lib/cron/timezone-window"

export type DailyNudgeCronResult = {
  usersNotified: number
  usersSkipped: number
  usersSkippedDedupe: number
  usersSkippedTimezone: number
  sent: string[]
  skipped?: string[]
  skippedDedupe?: string[]
  errors?: { email: string; error: string }[]
}

type RunDailyNudgeCronInput = {
  send: (email: string, name?: string) => Promise<unknown>
  now?: Date
  requireTimezoneWindow?: boolean
}

/**
 * Daily habit nudge when streak slipped 48–72h ago, at 10 AM local.
 */
export async function runDailyNudgeCron({
  send,
  now = new Date(),
  requireTimezoneWindow = true,
}: RunDailyNudgeCronInput): Promise<DailyNudgeCronResult> {
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000)
  const threeDaysAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000)

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
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          preferences: true,
          timezone: true,
        },
      },
    },
  })

  const sent: string[] = []
  const skippedPreference: string[] = []
  const skippedDedupe: string[] = []
  const skippedTimezone: string[] = []
  const errors: { email: string; error: string }[] = []
  const delayMs = cronSendDelayMs()

  for (const streak of droppedOffStreaks) {
    if (!streak.user?.email) continue

    const timeZone = normalizeTimeZone(streak.user.timezone)

    if (
      requireTimezoneWindow &&
      !isInLocalSendWindow(now, timeZone, RHYTHM_SEND_WINDOWS.dailyNudge)
    ) {
      skippedTimezone.push(streak.user.email)
      continue
    }

    const result = await sendRhythmEmailIfEligible({
      userId: streak.user.id,
      email: streak.user.email,
      preferences: streak.user.preferences,
      preferenceKey: "dailyNudge",
      timeZone,
      now,
      send: () =>
        send(streak.user.email, streak.user.name ?? undefined),
    })

    if (result.status === "sent") {
      sent.push(streak.user.email)
      if (delayMs > 0) await sleep(delayMs)
    } else if (result.status === "skipped" && result.reason === "preference") {
      skippedPreference.push(streak.user.email)
    } else if (result.status === "skipped" && result.reason === "dedupe") {
      skippedDedupe.push(streak.user.email)
    } else if (result.status === "error") {
      errors.push({ email: streak.user.email, error: result.message })
    }
  }

  return {
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
