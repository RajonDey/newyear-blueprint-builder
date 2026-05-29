import { db } from "@/lib/db"
import { shouldSendEmail } from "@/lib/cron/email-eligibility"
import {
  isRhythmEmailBlockedToday,
  mergeRhythmEmailSent,
} from "@/lib/cron/email-dedupe"
import type { EmailPreferenceKey } from "@/lib/user-preferences"

export type RhythmEmailSkipReason = "preference" | "dedupe" | "error"

export type RhythmEmailResult =
  | { status: "sent" }
  | { status: "skipped"; reason: RhythmEmailSkipReason }
  | { status: "error"; message: string }

export function cronSendDelayMs(): number {
  const raw = process.env.EMAIL_CRON_SEND_DELAY_MS
  if (!raw) return 100
  const n = parseInt(raw, 10)
  return Number.isFinite(n) && n >= 0 ? n : 100
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

type SendRhythmEmailInput = {
  userId: string
  email: string
  preferences: unknown
  preferenceKey: EmailPreferenceKey
  timeZone?: string | null
  send: () => Promise<unknown>
  now?: Date
}

/**
 * Preference check, daily dedupe, send, and mark — shared by rhythm cron routes.
 */
export async function sendRhythmEmailIfEligible({
  userId,
  email,
  preferences,
  preferenceKey,
  timeZone,
  send,
  now = new Date(),
}: SendRhythmEmailInput): Promise<RhythmEmailResult> {
  if (!shouldSendEmail(preferences, preferenceKey)) {
    return { status: "skipped", reason: "preference" }
  }

  if (isRhythmEmailBlockedToday(preferences, now, timeZone)) {
    return { status: "skipped", reason: "dedupe" }
  }

  try {
    await send()
    await db.user.update({
      where: { id: userId },
      data: { preferences: mergeRhythmEmailSent(preferences, now, timeZone) },
    })
    return { status: "sent" }
  } catch (e) {
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Unknown error",
    }
  }
}
