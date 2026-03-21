import type { Metadata } from "next"
import Link from "next/link"
import { requireAuth } from "@/lib/auth-guard"
import { getGoalsForUser } from "@/lib/queries/goals"
import { GoalCard } from "@/components/goals/goal-card"
import { AppContent } from "@/components/shared/app-content"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Target, Sparkles } from "lucide-react"

export const metadata: Metadata = { title: "Goals" }

export default async function GoalsPage() {
  const session = await requireAuth()
  const { goals, activePlanYear } = await getGoalsForUser(session.user.id)

  if (goals.length === 0) {
    return (
      <AppContent variant="wide">
      <div className="space-y-6">
        <PageHeader title="Your Goals" description="Track your yearly intentions" />
        <EmptyState
          icon={Target}
          title="No goals yet"
          description={
            activePlanYear != null
              ? `Your ${activePlanYear} plan doesn’t have goals yet. Add them from your plan page.`
              : "Create your yearly plan to set meaningful goals for each area of your life."
          }
          action={
            activePlanYear != null ? (
              <Button asChild>
                <Link href={`/plan/${activePlanYear}#plan-goals`}>
                  <Sparkles className="mr-2 h-4 w-4" /> Add goals to your plan
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/plan/new">
                  <Sparkles className="mr-2 h-4 w-4" /> Create Your Plan
                </Link>
              </Button>
            )
          }
        />
      </div>
      </AppContent>
    )
  }

  const primaryGoals = goals.filter((g) => g.type === "PRIMARY")
  const secondaryGoals = goals.filter((g) => g.type === "SECONDARY")

  return (
    <AppContent variant="wide">
    <div className="space-y-8">
      <PageHeader
        title="Your Goals"
        description={`${goals.length} goal${goals.length !== 1 ? "s" : ""} across your yearly plan`}
      />

      {primaryGoals.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5" /> Primary Goals
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {primaryGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal as any} />
            ))}
          </div>
        </section>
      )}

      {secondaryGoals.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Secondary Goals
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {secondaryGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal as any} />
            ))}
          </div>
        </section>
      )}
    </div>
    </AppContent>
  )
}
