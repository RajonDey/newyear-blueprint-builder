import Link from "next/link"
import { CadenceContextRichText } from "@/components/check-in/cadence-context-banner"
import { mergeMonthlyResponses } from "@/lib/review-templates"
import { MONTH_SHORT_LABELS } from "@/lib/queries/rhythm-context"
import { CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"

interface ReviewRow {
  month: number
  year: number
  summary: string | null
  winsText: string | null
  challengesText: string | null
  adjustments: string | null
  nextMonthFocus: string | null
  responses: unknown
  completedAt: Date | string
}

function snippetForReview(row: ReviewRow): string | null {
  if (row.nextMonthFocus?.trim()) return row.nextMonthFocus.trim()
  const merged = mergeMonthlyResponses(row)
  for (const key of ["summary", "winsText", "adjustments"]) {
    const v = merged[key]?.trim()
    if (v) return v
  }
  return null
}

export function MonthlyHistoryRow({
  reviews,
  activeMonth,
}: {
  reviews: ReviewRow[]
  activeMonth?: number
}) {
  const recent = [...reviews]
    .filter((r) => r.month !== activeMonth)
    .sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
    )
    .slice(0, 3)

  if (recent.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
        <CalendarDays className="h-3.5 w-3.5" />
        Recent reviews
      </p>
      <div className="grid gap-2 sm:grid-cols-3">
        {recent.map((row) => {
          const label = MONTH_SHORT_LABELS[row.month - 1] ?? `M${row.month}`
          const snippet = snippetForReview(row)
          return (
            <Link
              key={row.month}
              href={`/rhythm/monthly?month=${row.month}&tab=review`}
              className={cn(
                "rounded-lg border border-border bg-card px-3 py-2.5 text-left transition-colors hover:bg-muted/40 hover:border-accent/30",
              )}
            >
              <p className="text-xs font-medium text-muted-foreground">
                {label} {row.year}
              </p>
              {snippet ? (
                <div className="mt-1 line-clamp-2 text-sm prose prose-sm dark:prose-invert max-w-none [&_p]:m-0">
                  <CadenceContextRichText html={snippet} />
                </div>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground italic">
                  Reviewed{" "}
                  {new Date(row.completedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
