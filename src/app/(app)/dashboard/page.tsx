import type { Metadata } from "next"
import Link from "next/link"
import { requireAuth } from "@/lib/auth-guard"
import { getDashboardData } from "@/lib/queries/dashboard"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { WheelChart } from "@/components/dashboard/wheel-chart"
import { GoalsOverview } from "@/components/dashboard/goals-overview"
import { WheelIcebreaker } from "@/components/dashboard/wheel-icebreaker"
import { IcebreakerUpsell } from "@/components/dashboard/icebreaker-upsell"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { AchievementsBadge } from "@/components/dashboard/achievements-badge"
import { AppContent } from "@/components/shared/app-content"
import { MandalaWatermark } from "@/components/shared/mandala-watermark"
import { OrnamentDivider } from "@/components/shared/ornament-divider"
import { Button } from "@/components/ui/button"
import { Compass, Sparkles } from "lucide-react"

export const metadata: Metadata = { title: "Dashboard" }

export default async function DashboardPage() {
  const session = await requireAuth()
  const data = await getDashboardData(session.user.id)

  if (!data) {
    return (
      <AppContent variant="wide">
        <WheelIcebreaker userName={session.user.name} />
      </AppContent>
    )
  }

  const firstName = session.user.name?.split(" ")[0] || "there"

  return (
    <AppContent variant="wide">
    <div className="relative space-y-8">
      <MandalaWatermark position="top-right" size="sm" />

      <div>
        <h1 className="font-display text-3xl font-semibold">
          Welcome back, {firstName}
        </h1>
        <p className="text-muted-foreground mt-1">
          Your {data.plan.year} plan at a glance — Week {data.currentWeek},{" "}
          {data.currentQuarter}
        </p>
      </div>

      <StatsCards
        goalStats={data.goalStats}
        streak={data.streak}
        systemsToday={data.systemsToday}
        currentQuarter={data.currentQuarter}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <WheelChart scores={data.wheelScores} />
        {data.goalStats.total === 0 ? (
          <IcebreakerUpsell />
        ) : (
          <GoalsOverview goals={data.goals as any} planYear={data.plan.year} />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <QuickActions />
        <AchievementsBadge userId={session.user.id} />
      </div>
    </div>
    </AppContent>
  )
}

