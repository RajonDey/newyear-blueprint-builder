import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { WheelChart } from "@/components/dashboard/wheel-chart"
import { WheelDeltaList } from "@/components/rhythm/wheel-delta-list"
import { RhythmRecapLink } from "@/components/rhythm/rhythm-recap-link"
import { Activity, Target } from "lucide-react"
import { cadencePlanHasContent } from "@/lib/cadence-plan-utils"
import { getCurrentQuarter } from "@/lib/queries/rhythm-context"
import { cn } from "@/lib/utils"

interface Goal {
  id: string
  title: string
  category: string
  status: string
}

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"]

interface PlanRow {
  quarter: string
  quarterFocus: string | null
  projectIntentions: unknown
  topIntentions: unknown
}

export function QuarterlyWorkspaceSidebar({
  year,
  reviewedCount,
  plannedCount,
  projects,
  wheelScores,
  previousQuarterWheel,
  reviews,
  plans,
}: {
  year: number
  reviewedCount: number
  plannedCount: number
  projects: Goal[]
  wheelScores: Record<string, number>
  previousQuarterWheel: Record<string, number> | null
  reviews: { quarter: string }[]
  plans: PlanRow[]
}) {
  const reviewedSet = new Set(reviews.map((r) => r.quarter))
  const currentQ = getCurrentQuarter()

  const onTrack = projects.filter((g) => g.status === "ON_TRACK").length
  const atRisk = projects.filter((g) => g.status === "AT_RISK").length
  const completed = projects.filter((g) => g.status === "COMPLETED").length

  const wheelScoresArray = Object.entries(wheelScores).map(([category, rating]) => ({
    category,
    rating,
  }))

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {year} seasons
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-end justify-between gap-2">
            <p className="font-display text-3xl tracking-tight tabular-nums">
              {reviewedCount}
              <span className="text-lg text-muted-foreground">/4</span>
            </p>
            <Badge variant="secondary" className="text-[10px] uppercase">
              reviewed
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="text-foreground font-medium tabular-nums">
              {plannedCount}
            </span>{" "}
            of 4 quarters planned
          </p>
          <div className="grid grid-cols-4 gap-2">
            {QUARTERS.map((q) => {
              const reviewed = reviewedSet.has(q)
              const planned = plans.some(
                (p) =>
                  p.quarter === q &&
                  cadencePlanHasContent({
                    quarterFocus: p.quarterFocus,
                    projectIntentions: p.projectIntentions,
                    topIntentions: p.topIntentions,
                  }),
              )
              const isCurrent = q === currentQ
              return (
                <div
                  key={q}
                  className={cn(
                    "rounded-lg border px-2 py-2 text-center text-xs font-medium",
                    reviewed && "border-emerald-500/40 bg-emerald-500/10",
                    planned &&
                      !reviewed &&
                      "border-sky-500/40 bg-sky-500/10",
                    isCurrent &&
                      !reviewed &&
                      !planned &&
                      "border-accent/40 bg-accent/5",
                    !reviewed && !planned && !isCurrent && "border-border bg-muted/30",
                  )}
                >
                  {q}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {projects.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-accent" />
              Project health
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg border bg-muted/30 px-2 py-2">
              <p className="text-muted-foreground">On track</p>
              <p className="font-display text-xl mt-0.5">{onTrack}</p>
            </div>
            <div className="rounded-lg border bg-muted/30 px-2 py-2">
              <p className="text-muted-foreground">At risk</p>
              <p className="font-display text-xl mt-0.5 text-red-600 dark:text-red-400">
                {atRisk}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/30 px-2 py-2">
              <p className="text-muted-foreground">Done</p>
              <p className="font-display text-xl mt-0.5 text-emerald-600 dark:text-emerald-400">
                {completed}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {wheelScoresArray.length > 0 && (
        <>
          <WheelChart scores={wheelScoresArray} />
          <WheelDeltaList
            current={wheelScores}
            previous={previousQuarterWheel}
          />
        </>
      )}

      <Card className="border-dashed">
        <CardContent className="pt-4 pb-4">
          <p className="text-xs text-muted-foreground flex items-start gap-2 leading-relaxed">
            <Activity className="h-3.5 w-3.5 shrink-0 mt-0.5 text-accent" />
            Quarterly reviews reset the season — adjust projects before the next
            three months unfold.
          </p>
        </CardContent>
      </Card>

      <RhythmRecapLink cadence="quarterly" />
    </>
  )
}
