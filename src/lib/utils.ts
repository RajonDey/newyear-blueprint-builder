import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  getISOWeek,
  getISOWeekYear,
  setISOWeek,
  startOfISOWeek,
  subWeeks,
  addWeeks,
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
