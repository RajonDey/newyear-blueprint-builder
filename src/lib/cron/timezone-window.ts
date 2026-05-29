import { getYmdInTimeZone } from "@/lib/utils"
import type { QuarterLabel } from "@/lib/cron/cadence-labels"

const WEEKDAY_MAP: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
}

export type RhythmSendWindow = {
  /** Local hour 0–23 (checked at top of the hour). */
  hour: number
  /** 0 = Sunday … 6 = Saturday */
  dayOfWeek?: number
  dayOfMonth?: number
  /** First Monday of the month (day 1–7). */
  firstMonday?: boolean
  /** Local calendar months 1–12. */
  months?: number[]
}

export const RHYTHM_SEND_WINDOWS = {
  weeklyPlan: { hour: 18, dayOfWeek: 0 },
  weeklyReview: { hour: 17, dayOfWeek: 5 },
  monthlyPlan: { hour: 8, dayOfMonth: 1 },
  monthlyReview: { hour: 17, dayOfMonth: 25 },
  quarterlyPlan: { hour: 8, firstMonday: true, months: [1, 4, 7, 10] },
  quarterlyReview: { hour: 17, dayOfMonth: 15, months: [3, 6, 9, 12] },
  dailyNudge: { hour: 10 },
} as const satisfies Record<string, RhythmSendWindow>

export function normalizeTimeZone(timeZone: string | null | undefined): string {
  const tz = timeZone?.trim()
  return tz && tz.length > 0 ? tz : "UTC"
}

export function getLocalHour(date: Date, timeZone: string): number {
  const hour = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    hour12: false,
  }).format(date)
  return parseInt(hour, 10)
}

export function getLocalWeekday(date: Date, timeZone: string): number {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
  }).format(date)
  return WEEKDAY_MAP[weekday] ?? 0
}

export function getLocalDayOfMonth(date: Date, timeZone: string): number {
  const day = new Intl.DateTimeFormat("en-US", {
    timeZone,
    day: "numeric",
  }).format(date)
  return parseInt(day, 10)
}

export function getLocalMonth(date: Date, timeZone: string): number {
  const month = new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "numeric",
  }).format(date)
  return parseInt(month, 10)
}

export function getLocalYear(date: Date, timeZone: string): number {
  const ymd = getYmdInTimeZone(date, timeZone)
  return parseInt(ymd.slice(0, 4), 10)
}

export function getQuarterInTimeZone(
  date: Date,
  timeZone: string,
): QuarterLabel {
  const month = getLocalMonth(date, timeZone)
  if (month <= 3) return "Q1"
  if (month <= 6) return "Q2"
  if (month <= 9) return "Q3"
  return "Q4"
}

export function isFirstMondayInTimeZone(date: Date, timeZone: string): boolean {
  return (
    getLocalWeekday(date, timeZone) === 1 &&
    getLocalDayOfMonth(date, timeZone) <= 7
  )
}

/** True when the user's local clock is in the target send hour and day rules match. */
export function isInLocalSendWindow(
  date: Date,
  timeZone: string,
  window: RhythmSendWindow,
): boolean {
  const tz = normalizeTimeZone(timeZone)
  if (getLocalHour(date, tz) !== window.hour) return false

  if (window.dayOfWeek !== undefined) {
    if (getLocalWeekday(date, tz) !== window.dayOfWeek) return false
  }

  if (window.dayOfMonth !== undefined) {
    if (getLocalDayOfMonth(date, tz) !== window.dayOfMonth) return false
  }

  if (window.firstMonday && !isFirstMondayInTimeZone(date, tz)) {
    return false
  }

  if (window.months && !window.months.includes(getLocalMonth(date, tz))) {
    return false
  }

  return true
}

/** Jan 2–7 in the user's local calendar. */
export function isNewYearSetupWindowForUser(
  date: Date,
  timeZone: string,
): boolean {
  const tz = normalizeTimeZone(timeZone)
  const month = getLocalMonth(date, tz)
  const day = getLocalDayOfMonth(date, tz)
  return month === 1 && day >= 2 && day <= 7
}

/** Dec 20–28 in the user's local calendar. */
export function isYearReflectionWindowForUser(
  date: Date,
  timeZone: string,
): boolean {
  const tz = normalizeTimeZone(timeZone)
  const month = getLocalMonth(date, tz)
  const day = getLocalDayOfMonth(date, tz)
  return month === 12 && day >= 20 && day <= 28
}
