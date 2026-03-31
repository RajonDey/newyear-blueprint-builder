import type { Metadata } from "next"
import { requireAuth } from "@/lib/auth-guard"
import { getDashboardData } from "@/lib/queries/dashboard"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { WheelChart } from "@/components/dashboard/wheel-chart"
import { GoalsOverview } from "@/components/dashboard/goals-overview"
import { WelcomeDashboard } from "@/components/dashboard/welcome-dashboard"
import { IcebreakerUpsell } from "@/components/dashboard/icebreaker-upsell"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { AchievementsBadge } from "@/components/dashboard/achievements-badge"
import { AppContent } from "@/components/shared/app-content"
import { MandalaWatermark } from "@/components/shared/mandala-watermark"
import { PageHeader } from "@/components/shared/page-header"
import { Compass, Sparkles } from "lucide-react"

export const metadata: Metadata = { title: "Dashboard" }

export default async function DashboardPage() {
  const session = await requireAuth()
  const data = await getDashboardData(session.user.id)

  if (!data) {
    return (
      <AppContent variant="wide">
        <WelcomeDashboard userName={session.user.name} />
      </AppContent>
    )
  }

  const firstName = session.user.name?.split(" ")[0] || "there"
  const hasCheckInThisWeek = data.lastCheckIn?.weekNumber === data.currentWeek
  const hasOpenSystems =
    data.systemsToday.total > 0 && data.systemsToday.completed < data.systemsToday.total
  const hasGoals = data.goalStats.total > 0

  const primaryAction = !hasGoals
    ? {
        label: "Add goals to your yearly plan",
        href: `/plan/${data.plan.year}#plan-goals`,
        icon: Sparkles,
        description: "Your plan needs concrete goals before execution can work.",
      }
    : !hasCheckInThisWeek
      ? {
          label: "Complete this week's review",
          href: "/rhythm/weekly?tab=review",
          icon: Compass,
          description: "Close the loop and carry a focused note into next week.",
        }
      : hasOpenSystems
        ? {
            label: "Complete today's habits",
            href: "/rhythm/daily",
            icon: Compass,
            description: "Small reps today keep your yearly plan alive.",
          }
        : {
            label: "Plan your next week",
            href: "/rhythm/weekly?tab=plan",
            icon: Compass,
            description: "Set priorities before the week drifts.",
          }

  return (
    <AppContent variant="wide">
    <div className="relative space-y-8">
      <MandalaWatermark position="top-right" size="sm" />

      <PageHeader
        title={`Welcome back, ${firstName}`}
        description={`Your ${data.plan.year} plan at a glance — Week ${data.currentWeek}, ${data.currentQuarter}`}
      />

      <StatsCards
        goalStats={data.goalStats}
        streak={data.streak}
        systemsToday={data.systemsToday}
        currentQuarter={data.currentQuarter}
        trends={data.trends}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <WheelChart scores={data.wheelScores} />
        {data.goalStats.total === 0 ? (
          <IcebreakerUpsell planYear={data.plan.year} />
        ) : (
          <GoalsOverview goals={data.goals as any} planYear={data.plan.year} />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <QuickActions primaryAction={primaryAction} />
        <AchievementsBadge userId={session.user.id} />
      </div>
    </div>
    </AppContent>
  )
}

