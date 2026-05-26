"use client"

import { useCallback } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, Compass } from "lucide-react"
import { cn } from "@/lib/utils"
import { MONTH_OPTIONS } from "@/lib/months"

export function MonthlyMonthBar({
  reviewedMonths,
  plannedMonths,
  activeMonth,
}: {
  reviewedMonths: Set<number>
  plannedMonths: Set<number>
  activeMonth: number
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentJsMonth = new Date().getMonth() + 1

  const selectMonth = useCallback(
    (month: number) => {
      const params = new URLSearchParams(searchParams.toString())
      if (month === currentJsMonth) {
        params.delete("month")
      } else {
        params.set("month", String(month))
      }
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [currentJsMonth, pathname, router, searchParams],
  )

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{reviewedMonths.size} of 12 months reviewed</span>
          <span className="tabular-nums font-medium">
            {Math.round((reviewedMonths.size / 12) * 100)}%
          </span>
        </div>
        <div
          className="h-1.5 rounded-full bg-muted overflow-hidden"
          role="progressbar"
          aria-valuenow={reviewedMonths.size}
          aria-valuemin={0}
          aria-valuemax={12}
        >
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${(reviewedMonths.size / 12) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-1.5">
        {MONTH_OPTIONS.map((m) => {
          const isActive = m.value === activeMonth
          const isReviewed = reviewedMonths.has(m.value)
          const isPlanned = plannedMonths.has(m.value)
          const isCurrent = m.value === currentJsMonth
          return (
            <button
              key={m.value}
              type="button"
              onClick={() => selectMonth(m.value)}
              className={cn(
                "relative rounded-lg border px-2 py-2.5 text-center text-sm font-medium transition-colors",
                isActive
                  ? "border-accent bg-accent/10 text-foreground ring-1 ring-accent/40"
                  : "hover:bg-muted/50",
                isReviewed &&
                  !isActive &&
                  "border-emerald-500/40 bg-emerald-500/15 text-foreground",
                isPlanned &&
                  !isActive &&
                  !isReviewed &&
                  "border-sky-500/40 bg-sky-500/10 text-foreground",
                isCurrent && !isActive && !isReviewed && !isPlanned && "border-accent/30",
              )}
            >
              {m.label}
              {isReviewed && (
                <CheckCircle2 className="absolute top-1 right-1 h-3 w-3 text-emerald-500" />
              )}
              {!isReviewed && isPlanned && (
                <Compass className="absolute top-1 right-1 h-3 w-3 text-sky-500" />
              )}
            </button>
          )
        })}
      </div>
    </>
  )
}

export function useActiveMonthFromUrl(initialMonth?: number): number {
  const searchParams = useSearchParams()
  const raw = searchParams.get("month")
  if (raw) {
    const n = parseInt(raw, 10)
    if (!isNaN(n) && n >= 1 && n <= 12) return n
  }
  if (initialMonth != null && initialMonth >= 1 && initialMonth <= 12) {
    return initialMonth
  }
  return new Date().getMonth() + 1
}
