"use client"

import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getWeekRhythmLabel } from "@/lib/utils"

interface WeekNavigatorProps {
  weekNumber: number
  year: number
  isCurrentWeek: boolean
  prevWeek: { weekNumber: number; year: number }
  nextWeek: { weekNumber: number; year: number }
  currentWeek: { weekNumber: number; year: number }
}

function weekUrl(w: number, y: number) {
  return `/rhythm/weekly?week=${w}&year=${y}`
}

export function WeekNavigator({
  weekNumber,
  year,
  isCurrentWeek,
  prevWeek,
  nextWeek,
  currentWeek,
}: WeekNavigatorProps) {
  const isFuture =
    nextWeek.year > currentWeek.year ||
    (nextWeek.year === currentWeek.year && nextWeek.weekNumber > currentWeek.weekNumber)

  return (
    <div className="flex flex-col items-stretch gap-1 sm:items-end">
      <div className="flex items-center justify-center gap-2 sm:justify-end">
        <Button variant="ghost" size="icon" className="h-11 w-11 sm:h-8 sm:w-8" asChild>
          <Link href={weekUrl(prevWeek.weekNumber, prevWeek.year)}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous week</span>
          </Link>
        </Button>

        <span className="text-sm tabular-nums text-muted-foreground min-w-[7.5rem] text-center">
          Week {weekNumber}, {year}
        </span>

        {!isFuture ? (
          <Button variant="ghost" size="icon" className="h-11 w-11 sm:h-8 sm:w-8" asChild>
            <Link href={weekUrl(nextWeek.weekNumber, nextWeek.year)}>
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next week</span>
            </Link>
          </Button>
        ) : (
          <div className="h-11 w-11 sm:h-8 sm:w-8" />
        )}

        {!isCurrentWeek && (
          <Button variant="outline" size="sm" className="ml-1 min-h-11 text-xs sm:h-7 sm:min-h-0" asChild>
            <Link href="/rhythm/weekly">Today</Link>
          </Button>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground tabular-nums text-center sm:text-right max-w-full leading-snug px-1">
        {getWeekRhythmLabel(weekNumber, year)}
      </p>
    </div>
  )
}
