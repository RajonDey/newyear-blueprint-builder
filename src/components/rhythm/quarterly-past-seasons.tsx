import Link from "next/link"
import {
  CadenceContextRichText,
} from "@/components/check-in/cadence-context-banner"
import { mergeQuarterlyResponses } from "@/lib/review-templates"
import { pickQuarterlyFocusText } from "@/lib/queries/rhythm-context"
import { Activity } from "lucide-react"

interface QuarterlyReviewRow {
  quarter: string
  summary: string | null
  winsText: string | null
  challengesText: string | null
  adjustments: string | null
  responses: unknown
}

const QUARTER_LABELS: Record<string, string> = {
  Q1: "Jan – Mar",
  Q2: "Apr – Jun",
  Q3: "Jul – Sep",
  Q4: "Oct – Dec",
}

const QUARTER_ORDER = ["Q1", "Q2", "Q3", "Q4"] as const

function reviewSnippet(row: QuarterlyReviewRow): string | null {
  const text = pickQuarterlyFocusText(row)
  if (text) return text
  const merged = mergeQuarterlyResponses(row)
  for (const key of ["summary", "winsText", "adjustments"]) {
    const v = merged[key]?.trim()
    if (v) return v
  }
  return null
}

export function QuarterlyPastSeasons({
  year,
  reviews,
  activeQuarter,
}: {
  year: number
  reviews: QuarterlyReviewRow[]
  activeQuarter?: string
}) {
  const past = [...reviews]
    .filter((r) => r.quarter !== activeQuarter)
    .sort(
      (a, b) =>
        QUARTER_ORDER.indexOf(b.quarter as (typeof QUARTER_ORDER)[number]) -
        QUARTER_ORDER.indexOf(a.quarter as (typeof QUARTER_ORDER)[number]),
    )

  if (past.length === 0) return null

  return (
    <details className="group rounded-lg border border-border bg-card overflow-hidden">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-muted/40 transition-colors">
        <Activity className="h-4 w-4 text-accent shrink-0" />
        <span>Past seasons</span>
        <span className="text-xs font-normal text-muted-foreground">
          {past.length} saved
        </span>
      </summary>
      <div className="border-t border-border px-4 py-4">
        <ol className="relative ml-2 space-y-5 border-l border-border pl-6">
          {past.map((row) => {
            const snippet = reviewSnippet(row)
            const months = QUARTER_LABELS[row.quarter] ?? ""
            return (
              <li key={row.quarter} className="relative">
                <span
                  className="absolute -left-[27px] flex h-3 w-3 rounded-full bg-accent ring-4 ring-card"
                  aria-hidden
                />
                <div className="text-xs text-muted-foreground">
                  {row.quarter} · {year}
                  {months ? ` · ${months}` : ""}
                </div>
                {snippet ? (
                  <div className="mt-1 text-sm prose prose-sm dark:prose-invert max-w-none">
                    <CadenceContextRichText html={snippet} />
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground italic">
                    Review saved — no summary text.
                  </p>
                )}
                <Link
                  href={`/rhythm/quarterly?quarter=${row.quarter}`}
                  className="mt-2 inline-block text-xs text-accent hover:underline"
                >
                  Open {row.quarter} review
                </Link>
              </li>
            )
          })}
        </ol>
      </div>
    </details>
  )
}
