import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { requireAuth } from "@/lib/auth-guard"
import { db } from "@/lib/db"
import { getPlanById } from "@/lib/queries/plans"
import { planLimits } from "@/lib/config"
import { GoalCard } from "@/components/goals/goal-card"
import { PlanAddGoalDialog } from "@/components/plan/plan-add-goal-dialog"
import { WheelChart } from "@/components/dashboard/wheel-chart"
import { AppContent } from "@/components/shared/app-content"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { sanitizeRichTextHtml } from "@/lib/sanitize"
import { ShieldOff } from "lucide-react"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string }>
}): Promise<Metadata> {
  const { year } = await params
  return { title: `${year} Plan` }
}

export default async function PlanYearPage({
  params,
}: {
  params: Promise<{ year: string }>
}) {
  const session = await requireAuth()
  const { year: yearStr } = await params
  const yearNum = parseInt(yearStr, 10)

  if (isNaN(yearNum)) notFound()

  const plan = await db.yearlyPlan.findFirst({
    where: { userId: session.user.id, year: yearNum },
    select: { id: true },
  })

  if (!plan) notFound()

  const fullPlan = await getPlanById(plan.id, session.user.id)
  if (!fullPlan) notFound()

  const wheelScores = fullPlan.wheelEntries.map((e) => ({
    category: e.category,
    rating: e.rating,
  }))

  const reflections = fullPlan.reflections as Record<string, string> | null

  const tier = session.user.planTier === "PRO" ? "PRO" : "FREE"
  const maxGoals = planLimits[tier].maxGoalsPerPlan

  return (
    <AppContent variant="wide">
    <div className="space-y-8">
      <PageHeader
        title={`${yearNum} Plan`}
        description={`Created ${fullPlan.createdAt.toLocaleDateString()}`}
      >
        <Badge variant={fullPlan.status === "ACTIVE" ? "default" : "secondary"}>
          {fullPlan.status}
        </Badge>
      </PageHeader>

      {(() => {
        const hasReflections = reflections && Object.values(reflections).some((v) => v)
        return (
          <div className={`grid gap-6 ${hasReflections ? "lg:grid-cols-2" : ""}`}>
            <WheelChart scores={wheelScores} />
            {hasReflections && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg">Reflections</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {reflections.wins && (
                    <div>
                      <p className="font-medium text-xs uppercase tracking-wider text-muted-foreground">Wins</p>
                      <div className="mt-0.5 prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(reflections.wins) }} />
                    </div>
                  )}
                  {reflections.gratitude && (
                    <div>
                      <p className="font-medium text-xs uppercase tracking-wider text-muted-foreground">Gratitude</p>
                      <div className="mt-0.5 prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(reflections.gratitude) }} />
                    </div>
                  )}
                  {reflections.lessons && (
                    <div>
                      <p className="font-medium text-xs uppercase tracking-wider text-muted-foreground">Lessons</p>
                      <div className="mt-0.5 prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(reflections.lessons) }} />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )
      })()}

      <section id="plan-goals" className="scroll-mt-24 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-xl font-semibold">Goals</h2>
          <PlanAddGoalDialog
            planId={fullPlan.id}
            goalCount={fullPlan.goals.length}
            maxGoals={maxGoals}
            planTier={tier}
          />
        </div>

        {fullPlan.goals.length === 0 ? (
          <p className="text-sm text-muted-foreground rounded-lg border border-dashed bg-muted/20 px-4 py-6">
            No goals on this plan yet. Use{" "}
            <span className="font-medium text-foreground">Add goal</span> to
            create one—you can add checkpoints and daily systems from each goal&apos;s
            page.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {fullPlan.goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal as any} />
            ))}
          </div>
        )}
      </section>

      {fullPlan.antiGoals.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold">Anti-Goals</h2>
          <ul className="space-y-2">
            {fullPlan.antiGoals.map((ag) => (
              <li key={ag.id} className="flex items-start gap-2 text-sm">
                <ShieldOff className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <span>{ag.description}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
    </AppContent>
  )
}
