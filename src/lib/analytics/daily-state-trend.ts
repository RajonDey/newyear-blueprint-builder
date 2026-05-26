import { subDays } from "date-fns"
import { getYmdInTimeZone } from "@/lib/systems-period"

export type DailyStateTrendPoint = {
  /** YYYY-MM-DD in the user's timezone. */
  date: string
  label: string
  mood: number | null
  energy: number | null
}

function parseYmdToUtcMidnight(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map((s) => parseInt(s, 10))
  return new Date(Date.UTC(y, m - 1, d))
}

function formatTrendLabel(ymd: string): string {
  const d = parseYmdToUtcMidnight(ymd)
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })
}

/** Minimum distinct days with mood or energy before we render the daily chart. */
export const DAILY_STATE_CHART_MIN_DAYS = 7

/** Default lookback for analytics daily mood/energy lines. */
export const DAILY_STATE_TREND_DAYS = 30

/**
 * Build a fixed-length daily series (newest last) for mood/energy charts.
 * Missing days stay null so gaps read honestly on the line chart.
 */
export function buildDailyStateTrendSeries(
  rows: { date: Date; mood: number | null; energy: number | null }[],
  days: number,
  timeZone: string,
  anchor: Date = new Date(),
): DailyStateTrendPoint[] {
  const byYmd = new Map<string, { mood: number | null; energy: number | null }>()
  for (const row of rows) {
    const ymd = getYmdInTimeZone(row.date, timeZone)
    byYmd.set(ymd, { mood: row.mood, energy: row.energy })
  }

  const series: DailyStateTrendPoint[] = []
  for (let i = days - 1; i >= 0; i--) {
    const ymd = getYmdInTimeZone(subDays(anchor, i), timeZone)
    const point = byYmd.get(ymd)
    series.push({
      date: ymd,
      label: formatTrendLabel(ymd),
      mood: point?.mood ?? null,
      energy: point?.energy ?? null,
    })
  }
  return series
}

export function countDailyStateTrendPoints(series: DailyStateTrendPoint[]): number {
  return series.filter((p) => p.mood != null || p.energy != null).length
}

export function dailyStateTrendSinceYmd(
  days: number,
  timeZone: string,
  anchor: Date = new Date(),
): string {
  return getYmdInTimeZone(subDays(anchor, days - 1), timeZone)
}

export { parseYmdToUtcMidnight }
