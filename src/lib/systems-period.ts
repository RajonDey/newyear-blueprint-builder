import { getISOWeek, getISOWeekYear } from "date-fns"
import type { Frequency } from "@prisma/client"

/** Calendar YYYY-MM-DD as interpreted in `timeZone` (e.g. en-CA). */
export function getYmdInTimeZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

function ymdToUtcNoon(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
}

function sameIsoWeek(aYmd: string, bYmd: string): boolean {
  const a = ymdToUtcNoon(aYmd)
  const b = ymdToUtcNoon(bYmd)
  return (
    getISOWeek(a) === getISOWeek(b) &&
    getISOWeekYear(a) === getISOWeekYear(b)
  )
}

function sameCalendarMonth(aYmd: string, bYmd: string): boolean {
  return aYmd.slice(0, 7) === bYmd.slice(0, 7)
}

/**
 * Whether the system is satisfied for the current period (for streak / "all done").
 */
export function isSystemCompletedForPeriod(
  frequency: Frequency,
  todayYmd: string,
  completionYmds: string[]
): boolean {
  if (completionYmds.length === 0) return false

  switch (frequency) {
    case "DAILY":
      return completionYmds.includes(todayYmd)
    case "WEEKLY":
      return completionYmds.some((ymd) => sameIsoWeek(ymd, todayYmd))
    case "MONTHLY":
      return completionYmds.some((ymd) => sameCalendarMonth(ymd, todayYmd))
    default:
      return completionYmds.includes(todayYmd)
  }
}
