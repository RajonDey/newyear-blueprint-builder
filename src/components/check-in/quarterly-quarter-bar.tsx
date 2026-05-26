"use client"

import { useCallback } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, Compass } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  QUARTER_OPTIONS,
  type QuarterValue,
} from "@/lib/quarters"
import { getCurrentQuarter } from "@/lib/queries/rhythm-context"

export function QuarterlyQuarterBar({
  reviewedQuarters,
  plannedQuarters,
  activeQuarter,
}: {
  reviewedQuarters: Set<string>
  plannedQuarters: Set<string>
  activeQuarter: QuarterValue
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentQ = getCurrentQuarter()

  const selectQuarter = useCallback(
    (quarter: QuarterValue) => {
      const params = new URLSearchParams(searchParams.toString())
      if (quarter === currentQ) {
        params.delete("quarter")
      } else {
        params.set("quarter", quarter)
      }
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [currentQ, pathname, router, searchParams],
  )

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{reviewedQuarters.size} of 4 quarters reviewed</span>
          <span className="tabular-nums font-medium">
            {Math.round((reviewedQuarters.size / 4) * 100)}%
          </span>
        </div>
        <div
          className="h-1.5 rounded-full bg-muted overflow-hidden"
          role="progressbar"
          aria-valuenow={reviewedQuarters.size}
          aria-valuemin={0}
          aria-valuemax={4}
        >
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${(reviewedQuarters.size / 4) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {QUARTER_OPTIONS.map((q) => {
          const isActive = q.value === activeQuarter
          const isReviewed = reviewedQuarters.has(q.value)
          const isPlanned = plannedQuarters.has(q.value)
          const isCurrent = q.value === currentQ
          return (
            <button
              key={q.value}
              type="button"
              onClick={() => selectQuarter(q.value)}
              className={cn(
                "relative rounded-lg border px-2 py-3 text-center transition-colors",
                isActive
                  ? "border-accent bg-accent/10 text-foreground ring-1 ring-accent/40"
                  : "hover:bg-muted/50",
                isReviewed &&
                  !isActive &&
                  "border-emerald-500/40 bg-emerald-500/15",
                isPlanned &&
                  !isActive &&
                  !isReviewed &&
                  "border-sky-500/40 bg-sky-500/10",
                isCurrent && !isActive && !isReviewed && !isPlanned && "border-accent/30",
              )}
            >
              <span className="text-sm font-medium">{q.label}</span>
              <span className="block text-xs text-muted-foreground">{q.months}</span>
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

export function useActiveQuarterFromUrl(
  initialQuarter?: QuarterValue,
): QuarterValue {
  const searchParams = useSearchParams()
  const raw = searchParams.get("quarter")
  if (raw === "Q1" || raw === "Q2" || raw === "Q3" || raw === "Q4") return raw
  if (initialQuarter) return initialQuarter
  return getCurrentQuarter()
}
