"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface DayData {
  date: string
  count: number
}

function getLast90Days(): string[] {
  const days: string[] = []
  const now = new Date()
  for (let i = 89; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

function getIntensity(count: number, total: number): number {
  if (count === 0 || total === 0) return 0
  const ratio = count / total
  if (ratio >= 1) return 4
  if (ratio >= 0.75) return 3
  if (ratio >= 0.5) return 2
  return 1
}

const INTENSITY_CLASSES = [
  "bg-muted",
  "bg-emerald-200 dark:bg-emerald-900/40",
  "bg-emerald-300 dark:bg-emerald-800/60",
  "bg-emerald-400 dark:bg-emerald-700/70",
  "bg-emerald-500 dark:bg-emerald-600",
]

const WEEKDAY_LABELS = ["M", "", "W", "", "F", "", ""]

export function HabitsHeatmap() {
  const [days, setDays] = useState<DayData[]>([])
  const [totalSystems, setTotalSystems] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/systems/history")
      .then((res) => res.json())
      .then((json) => {
        setDays(json.data?.days ?? [])
        setTotalSystems(json.data?.totalSystems ?? 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const dayMap = useMemo(() => {
    const m = new Map<string, number>()
    for (const d of days) m.set(d.date, d.count)
    return m
  }, [days])

  const allDays = useMemo(() => getLast90Days(), [])

  const weeks = useMemo(() => {
    const result: string[][] = []
    let currentWeek: string[] = []
    for (const day of allDays) {
      const d = new Date(day + "T12:00:00Z")
      const dow = d.getUTCDay()
      const mondayIndex = dow === 0 ? 6 : dow - 1
      if (mondayIndex === 0 && currentWeek.length > 0) {
        result.push(currentWeek)
        currentWeek = []
      }
      currentWeek.push(day)
    }
    if (currentWeek.length > 0) result.push(currentWeek)
    return result
  }, [allDays])

  const activeDays = days.filter((d) => d.count > 0).length
  const perfectDays = days.filter((d) => d.count >= totalSystems && totalSystems > 0).length

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (totalSystems === 0) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-accent" />
            90-day activity
          </CardTitle>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span><strong className="text-foreground">{activeDays}</strong> active days</span>
            <span><strong className="text-foreground">{perfectDays}</strong> perfect days</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-[3px]">
          <div className="flex flex-col gap-[3px] mr-1 pt-0">
            {WEEKDAY_LABELS.map((label, i) => (
              <div key={i} className="h-[14px] w-4 flex items-center justify-end">
                <span className="text-[10px] text-muted-foreground leading-none">{label}</span>
              </div>
            ))}
          </div>
          {weeks.map((week, wi) => {
            const firstDay = new Date(week[0] + "T12:00:00Z")
            const firstDow = firstDay.getUTCDay()
            const startIdx = firstDow === 0 ? 6 : firstDow - 1
            return (
              <div key={wi} className="flex flex-col gap-[3px]">
                {Array.from({ length: 7 }).map((_, di) => {
                  const dayIdx = di - startIdx
                  const day = dayIdx >= 0 && dayIdx < week.length ? week[dayIdx] : null
                  if (!day) {
                    return <div key={di} className="h-[14px] w-[14px]" />
                  }
                  const count = dayMap.get(day) ?? 0
                  const intensity = getIntensity(count, totalSystems)
                  const d = new Date(day + "T12:00:00Z")
                  const label = d.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                  return (
                    <div
                      key={di}
                      className={cn(
                        "h-[14px] w-[14px] rounded-[2px] transition-colors",
                        INTENSITY_CLASSES[intensity]
                      )}
                      title={`${label}: ${count}/${totalSystems} habits`}
                    />
                  )
                })}
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-1.5 mt-3 justify-end">
          <span className="text-[10px] text-muted-foreground">Less</span>
          {INTENSITY_CLASSES.map((cls, i) => (
            <div key={i} className={cn("h-[10px] w-[10px] rounded-[2px]", cls)} />
          ))}
          <span className="text-[10px] text-muted-foreground">More</span>
        </div>
      </CardContent>
    </Card>
  )
}
