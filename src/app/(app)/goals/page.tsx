import type { Metadata } from "next"
import Link from "next/link"
import { requireAuth } from "@/lib/auth-guard"
import { getGoalsForUser } from "@/lib/queries/goals"
import { GoalCard } from "@/components/goals/goal-card"
import { QuickStartGoal } from "@/components/goals/quick-start-goal"
import { AppContent } from "@/components/shared/app-content"
import { PageHeader } from "@/components/shared/page-header"
import { OrnamentDivider } from "@/components/shared/ornament-divider"
import { Button } from "@/components/ui/button"
import { Target, Sparkles } from "lucide-react"

export const metadata: Metadata = { title: "Goals" }

export default async function GoalsPage() {
  const session = await requireAuth()
  const { goals, activePlanYear } = await getGoalsForUser(session.user.id)

  if (goals.length === 0) {
    const hasPlan = activePlanYear != null
    return (
      <AppContent variant="wide">
        <div className="space-y-8">
          <PageHeader
            title="Your Goals"
            description={
              hasPlan
                ? "Add goals to start tracking your progress across the year."
                : "This is where your yearly goals will live — with progress tracking, key results, and weekly momentum."
            }
          />

          <div className="grid gap-4 sm:grid-cols-3 max-w-2xl mx-auto">
            {[
              { label: "Key Results", desc: "Track measurable outcomes like \"Run 42km\"" },
              { label: "Weekly Progress", desc: "See momentum from your weekly reviews" },
              { label: "Journal", desc: "Capture notes and reflections per goal" },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-dashed p-4 text-center">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </div>
            ))}
          </div>

          <OrnamentDivider variant="dot" />

          <div className="max-w-lg mx-auto space-y-4">
            <QuickStartGoal />

            <div className="text-center text-sm text-muted-foreground">or</div>

            <div className="text-center">
              {hasPlan ? (
                <Button variant="outline" asChild>
                  <Link href={`/plan/${activePlanYear}#plan-goals`}>
                    <Sparkles className="mr-2 h-4 w-4" /> Add goals via the full wizard
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" asChild>
                  <Link href="/plan/new">
                    <Sparkles className="mr-2 h-4 w-4" /> Or use the guided plan wizard (~15 min)
                  </Link>
                </Button>
              )}
            </div>
          </div>
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
