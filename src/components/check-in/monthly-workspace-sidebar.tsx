import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LIFE_CATEGORIES } from "@/lib/constants/categories"
import { RhythmRecapLink } from "@/components/rhythm/rhythm-recap-link"
import { cadencePlanHasContent } from "@/lib/cadence-plan-utils"
import { CalendarDays, Target } from "lucide-react"

interface Goal {
  id: string
  title: string
  category: string
  status: string
}

interface MonthlyReviewRow {
  month: number
  summary: string | null
  completedAt: Date | string
}

interface MonthlyPlanRow {
  month: number
  monthFocus: string | null
  projectIntentions: unknown
  topIntentions: unknown
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export function MonthlyWorkspaceSidebar({
  year,
  reviewedCount,
  plannedCount,
  projects,
  reviews,
  plans,
}: {
  year: number
  reviewedCount: number
  plannedCount: number
  projects: Goal[]
  reviews: MonthlyReviewRow[]
  plans: MonthlyPlanRow[]
}) {
  const latestReview = [...reviews].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  )[0]

  const latestLabel = latestReview
    ? MONTH_NAMES[latestReview.month - 1] ?? `Month ${latestReview.month}`
    : null

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {year} progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-end justify-between gap-2">
            <p className="font-display text-3xl tracking-tight tabular-nums">
              {reviewedCount}
              <span className="text-lg text-muted-foreground">/12</span>
            </p>
            <Badge variant="secondary" className="text-[10px] uppercase">
              reviewed
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="text-foreground font-medium tabular-nums">
              {plannedCount}
            </span>{" "}
            of 12 months planned
          </p>
          <div className="grid grid-cols-12 gap-1">
            {Array.from({ length: 12 }, (_, i) => {
              const month = i + 1
              const reviewed = reviews.some((r) => r.month === month)
              const planned = plans.some(
                (p) =>
                  p.month === month &&
                  cadencePlanHasContent({
                    monthFocus: p.monthFocus,
                    projectIntentions: p.projectIntentions,
                    topIntentions: p.topIntentions,
                  }),
              )
              const isCurrent = month === new Date().getMonth() + 1
              return (
                <div
                  key={month}
                  title={MONTH_NAMES[i]}
                  className={`h-2 rounded-sm ${
                    reviewed
                      ? "bg-emerald-500/80"
                      : planned
                        ? "bg-sky-500/70"
                        : isCurrent
                          ? "bg-accent/40"
                          : "bg-muted"
                  }`}
                />
              )
            })}
          </div>
          {latestLabel && (
            <p className="text-xs text-muted-foreground">
              Last reviewed: <span className="text-foreground">{latestLabel}</span>
            </p>
          )}
        </CardContent>
      </Card>

      {projects.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-accent" />
              Active projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {projects.slice(0, 6).map((g) => {
                const cat = LIFE_CATEGORIES.find((c) => c.id === g.category)
                return (
                  <li key={g.id} className="flex items-start gap-2">
                    {cat && (
                      <cat.icon
                        className="h-3.5 w-3.5 shrink-0 mt-0.5"
                        style={{ color: cat.color }}
                      />
                    )}
                    <Link
                      href={`/projects/${g.id}`}
                      className="leading-snug hover:text-accent transition-colors"
                    >
                      {g.title}
                    </Link>
                  </li>
                )
              })}
            </ul>
            {projects.length > 6 && (
              <p className="text-xs text-muted-foreground mt-2">
                +{projects.length - 6} more on{" "}
                <Link href="/projects" className="text-accent hover:underline">
                  projects
                </Link>
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="border-dashed">
        <CardContent className="pt-4 pb-4">
          <p className="text-xs text-muted-foreground flex items-start gap-2 leading-relaxed">
            <CalendarDays className="h-3.5 w-3.5 shrink-0 mt-0.5 text-accent" />
            Monthly reflections roll up into your quarterly review and year-end
            recap.
          </p>
        </CardContent>
      </Card>

      <RhythmRecapLink cadence="monthly" />
    </>
  )
}
