import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  addDays,
  addWeeks,
  endOfMonth,
  format,
  getISOWeek,
  getISOWeekYear,
  setISOWeek,
  startOfISOWeek,
  startOfMonth,
  subWeeks,
} from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

export function getBaseUrl(): string {
  if (typeof window !== "undefined") return ""
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  return "http://localhost:3000"
}

export function getCurrentYear(): number {
  const now = new Date()
  const month = now.getMonth()
  return month >= 9 ? now.getFullYear() + 1 : now.getFullYear()
}

function ymdToUtcNoon(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
}

export function getYmdInTimeZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

export function getIsoWeekContext(date: Date): { weekNumber: number; year: number } {
  return {
    weekNumber: getISOWeek(date),
    year: getISOWeekYear(date),
  }
}

export function getIsoWeekContextInTimeZone(
  date: Date,
  timeZone: string
): { weekNumber: number; year: number } {
  const ymd = getYmdInTimeZone(date, timeZone)
  const zonedDate = ymdToUtcNoon(ymd)
  return getIsoWeekContext(zonedDate)
}

export function getPreviousIsoWeekContext(
  weekNumber: number,
  year: number
): { weekNumber: number; year: number } {
  const weekAnchor = startOfISOWeek(
    setISOWeek(new Date(Date.UTC(year, 0, 4, 12, 0, 0)), weekNumber)
  )
  const prev = subWeeks(weekAnchor, 1)
  return getIsoWeekContext(prev)
}

export function getNextIsoWeekContext(
  weekNumber: number,
  year: number
): { weekNumber: number; year: number } {
  const weekAnchor = startOfISOWeek(
    setISOWeek(new Date(Date.UTC(year, 0, 4, 12, 0, 0)), weekNumber)
  )
  const next = addWeeks(weekAnchor, 1)
  return getIsoWeekContext(next)
}

export function getWeekNumber(date: Date): number {
  return getIsoWeekContext(date).weekNumber
}

/** ISO week anchor (Monday UTC noon) for a given week number + ISO week-year. */
export function getIsoWeekAnchor(weekNumber: number, year: number): Date {
  return startOfISOWeek(
    setISOWeek(new Date(Date.UTC(year, 0, 4, 12, 0, 0)), weekNumber),
  )
}

function quarterForMonth(monthIndex: number): string {
  if (monthIndex < 3) return "Q1"
  if (monthIndex < 6) return "Q2"
  if (monthIndex < 9) return "Q3"
  return "Q4"
}

/**
 * Human label for weekly navigation — e.g. "Week 2 of 4 in May · Q2".
 */
export function getWeekRhythmLabel(weekNumber: number, year: number): string {
  const weekStart = getIsoWeekAnchor(weekNumber, year)
  const thursday = addDays(weekStart, 3)
  const monthIndex = thursday.getUTCMonth()
  const calYear = thursday.getUTCFullYear()
  const monthName = format(thursday, "MMMM")
  const quarter = quarterForMonth(monthIndex)

  const monthStart = startOfMonth(
    new Date(Date.UTC(calYear, monthIndex, 1, 12, 0, 0)),
  )
  const monthEnd = endOfMonth(monthStart)

  const weeksInMonth: { weekNumber: number; year: number }[] = []
  const seen = new Set<string>()
  let cursor = startOfISOWeek(monthStart)

  for (let i = 0; i < 6; i++) {
    const thurs = addDays(cursor, 3)
    if (
      thurs.getUTCMonth() === monthIndex &&
      thurs.getUTCFullYear() === calYear
    ) {
      const wn = getISOWeek(cursor)
      const wy = getISOWeekYear(cursor)
      const key = `${wy}-${wn}`
      if (!seen.has(key)) {
        seen.add(key)
        weeksInMonth.push({ weekNumber: wn, year: wy })
      }
    }
    cursor = addWeeks(cursor, 1)
    if (cursor > addWeeks(monthEnd, 1)) break
  }

  weeksInMonth.sort((a, b) =>
    a.year !== b.year ? a.year - b.year : a.weekNumber - b.weekNumber,
  )

  const idx = weeksInMonth.findIndex(
    (w) => w.weekNumber === weekNumber && w.year === year,
  )
  const weekInMonth = idx >= 0 ? idx + 1 : 1
  const totalWeeks = weeksInMonth.length || 4

  return `Week ${weekInMonth} of ${totalWeeks} in ${monthName} · ${quarter}`
}
