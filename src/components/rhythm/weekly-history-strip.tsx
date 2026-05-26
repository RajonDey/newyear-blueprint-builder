"use client"

/* Hallmark · design-system: design.md · designed-as-app */

import Link from "next/link"
import { cn } from "@/lib/utils"
import type { WeeklyConsistencyWeek } from "@/lib/queries/rhythm-stats"

function weekHref(week: WeeklyConsistencyWeek) {
  if (week.reviewed) {
    return `/rhythm/weekly?week=${week.weekNumber}&year=${week.year}&tab=review`
  }
  return `/rhythm/weekly?week=${week.weekNumber}&year=${week.year}`
}

export function WeeklyHistoryStrip({
  weeks,
  currentWeekNumber,
  currentYear,
}: {
  weeks: WeeklyConsistencyWeek[]
  currentWeekNumber: number
  currentYear: number
}) {
  if (weeks.length === 0) return null

  return (
    <div className="flex flex-col gap-1.5 border-y border-border py-3 sm:flex-row sm:items-center sm:gap-3">
      <span className="text-xs text-muted-foreground shrink-0">
        Last {weeks.length} weeks
      </span>
      <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
        {weeks.map((week) => {
          const isCurrent =
            week.weekNumber === currentWeekNumber && week.year === currentYear
          return (
            <Link
              key={`${week.year}-${week.weekNumber}`}
              href={weekHref(week)}
              title={
                week.reviewed
                  ? `Week ${week.weekNumber} — reviewed`
                  : `Week ${week.weekNumber} — no review`
              }
              className={cn(
                "flex shrink-0 flex-col items-center gap-0.5 rounded-md px-2 py-1.5 text-center transition-colors hover:bg-muted/60",
                isCurrent && "bg-amber-tint ring-1 ring-amber/30",
              )}
            >
              <span
                className={cn(
                  "block h-2 w-2 rounded-full",
                  week.reviewed
                    ? "bg-status-positive"
                    : "bg-muted-foreground/25",
                )}
                aria-hidden
              />
              <span className="text-[10px] tabular-nums text-muted-foreground">
                W{week.weekNumber}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
