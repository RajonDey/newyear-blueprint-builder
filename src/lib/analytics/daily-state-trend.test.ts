import { describe, expect, it } from "vitest"
import {
  buildDailyStateTrendSeries,
  countDailyStateTrendPoints,
  DAILY_STATE_CHART_MIN_DAYS,
} from "@/lib/analytics/daily-state-trend"

describe("buildDailyStateTrendSeries", () => {
  const anchor = new Date("2026-05-21T12:00:00.000Z")

  it("fills a 30-day window with nulls for missing days", () => {
    const series = buildDailyStateTrendSeries(
      [{ date: new Date("2026-05-21T00:00:00.000Z"), mood: 4, energy: 3 }],
      30,
      "UTC",
      anchor,
    )
    expect(series).toHaveLength(30)
    expect(series[series.length - 1]?.mood).toBe(4)
    expect(series[0]?.mood).toBeNull()
  })

  it("counts days with mood or energy for chart threshold", () => {
    const series = buildDailyStateTrendSeries(
      [
        { date: new Date("2026-05-19T00:00:00.000Z"), mood: 3, energy: null },
        { date: new Date("2026-05-20T00:00:00.000Z"), mood: null, energy: 4 },
      ],
      7,
      "UTC",
      anchor,
    )
    expect(countDailyStateTrendPoints(series)).toBe(2)
    expect(DAILY_STATE_CHART_MIN_DAYS).toBe(7)
  })
})
