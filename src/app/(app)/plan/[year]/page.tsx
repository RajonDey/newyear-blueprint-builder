import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { requireAuth } from "@/lib/auth-guard"
import { db } from "@/lib/db"
import { getPlanById } from "@/lib/queries/plans"
import { GoalCard } from "@/components/goals/goal-card"
import { WheelChart } from "@/components/dashboard/wheel-chart"
import { AppContent } from "@/components/shared/app-content"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

      <div className="grid gap-6 lg:grid-cols-2">
        <WheelChart scores={wheelScores} />

        {reflections && Object.values(reflections).some((v) => v) && (
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Reflections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {reflections.wins && (
                <div>
                  <p className="font-medium text-xs uppercase tracking-wider text-muted-foreground">Wins</p>
                  <p className="mt-0.5">{reflections.wins}</p>
                </div>
              )}
              {reflections.gratitude && (
                <div>
                  <p className="font-medium text-xs uppercase tracking-wider text-muted-foreground">Gratitude</p>
                  <p className="mt-0.5">{reflections.gratitude}</p>
                </div>
              )}
              {reflections.lessons && (
                <div>
                  <p className="font-medium text-xs uppercase tracking-wider text-muted-foreground">Lessons</p>
                  <p className="mt-0.5">{reflections.lessons}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {fullPlan.goals.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold">Goals</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {fullPlan.goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal as any} />
            ))}
          </div>
        </section>
      )}

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
