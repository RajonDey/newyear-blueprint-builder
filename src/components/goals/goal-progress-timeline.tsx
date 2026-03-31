"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, ExternalLink } from "lucide-react"

interface CheckInEntry {
  id: string
  progressRating: number
  notes?: string | null
  blockers?: string | null
  weeklyCheckIn: { weekNumber: number; year: number; completedAt: string }
}

interface GoalProgressTimelineProps {
  checkIns: CheckInEntry[]
}

const RATING_COLORS: Record<number, string> = {
  1: "bg-red-500",
  2: "bg-orange-500",
  3: "bg-amber-500",
  4: "bg-emerald-400",
  5: "bg-emerald-500",
}

const RATING_LABELS: Record<number, string> = {
  1: "Stuck",
  2: "Struggling",
  3: "Steady",
  4: "Good",
  5: "Great",
}

export function GoalProgressTimeline({ checkIns }: GoalProgressTimelineProps) {
  if (checkIns.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent" /> Weekly Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No progress entries yet. Complete a weekly review to start tracking
            this goal&apos;s momentum.
          </p>
        </CardContent>
      </Card>
    )
  }

  const sorted = [...checkIns].reverse()
  const [activeBarId, setActiveBarId] = useState<string | null>(null)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-accent" /> Weekly Progress
        </CardTitle>
        <p className="text-sm text-muted-foreground font-normal">
          From your weekly reviews — {checkIns.length} week{checkIns.length !== 1 ? "s" : ""} tracked
        </p>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="flex items-end gap-1 h-20 mb-4">
          {sorted.map((ci) => {
            const height = (ci.progressRating / 5) * 100
            const isActive = activeBarId === ci.id
            return (
              <div
                key={ci.id}
                className="group relative flex-1 min-w-0 flex flex-col items-center justify-end h-full cursor-pointer"
                onClick={() => setActiveBarId(isActive ? null : ci.id)}
                onMouseEnter={() => setActiveBarId(ci.id)}
                onMouseLeave={() => setActiveBarId(null)}
              >
                <div
                  className={`w-full max-w-[28px] rounded-t-sm transition-all ${RATING_COLORS[ci.progressRating] ?? "bg-muted"}`}
                  style={{ height: `${height}%` }}
                />
                {isActive && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-popover border text-popover-foreground text-xs px-2 py-1 rounded shadow-md whitespace-nowrap">
                      Wk {ci.weeklyCheckIn.weekNumber}: {RATING_LABELS[ci.progressRating]}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="space-y-3">
          {checkIns.slice(0, 5).map((ci) => (
            <Link
              key={ci.id}
              href={`/rhythm/weekly?week=${ci.weeklyCheckIn.weekNumber}&year=${ci.weeklyCheckIn.year}`}
              className="flex gap-3 text-sm group"
            >
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${RATING_COLORS[ci.progressRating]}`}
                >
                  {ci.progressRating}
                </div>
                <div className="w-px flex-1 bg-border" />
              </div>
              <div className="pb-4 min-w-0 flex-1">
                <p className="font-medium text-xs text-muted-foreground flex items-center gap-1">
                  Week {ci.weeklyCheckIn.weekNumber}, {ci.weeklyCheckIn.year}
                  <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
                {ci.notes && (
                  <p className="text-sm mt-0.5">{ci.notes}</p>
                )}
                {ci.blockers && (
                  <p className="text-sm mt-0.5 text-amber-600 dark:text-amber-400">
                    Blocker: {ci.blockers}
                  </p>
                )}
                {!ci.notes && !ci.blockers && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {RATING_LABELS[ci.progressRating]}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
