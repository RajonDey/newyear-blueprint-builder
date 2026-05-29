import {
  mergeUserPreferences,
  parseUserPreferences,
  type UserPreferences,
} from "@/lib/user-preferences"
import { getYmdInTimeZone } from "@/lib/utils"
import { normalizeTimeZone } from "@/lib/cron/timezone-window"

/** Calendar date YYYY-MM-DD in the user's timezone. */
export function rhythmEmailDateKey(
  date: Date = new Date(),
  timeZone?: string | null,
): string {
  return getYmdInTimeZone(date, normalizeTimeZone(timeZone))
}

export function getLastRhythmEmailDate(prefs: UserPreferences): string | null {
  return prefs.emailMeta?.lastRhythmEmailDate ?? null
}

/** True when this user already received a rhythm email today (local calendar day). */
export function isRhythmEmailBlockedToday(
  preferencesRaw: unknown,
  date: Date = new Date(),
  timeZone?: string | null,
): boolean {
  const prefs = parseUserPreferences(preferencesRaw)
  const last = getLastRhythmEmailDate(prefs)
  if (!last) return false
  return last === rhythmEmailDateKey(date, timeZone)
}

export function rhythmEmailSentPatch(
  date: Date = new Date(),
  timeZone?: string | null,
): UserPreferences {
  return {
    emailMeta: { lastRhythmEmailDate: rhythmEmailDateKey(date, timeZone) },
  }
}

export function mergeRhythmEmailSent(
  preferencesRaw: unknown,
  date: Date = new Date(),
  timeZone?: string | null,
): UserPreferences {
  const current = parseUserPreferences(preferencesRaw)
  return mergeUserPreferences(current, rhythmEmailSentPatch(date, timeZone))
}
