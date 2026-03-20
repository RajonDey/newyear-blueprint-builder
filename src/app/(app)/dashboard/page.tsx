import type { Metadata } from "next"
import Link from "next/link"
import { requireAuth } from "@/lib/auth-guard"
import { getDashboardData } from "@/lib/queries/dashboard"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { WheelChart } from "@/components/dashboard/wheel-chart"
import { GoalsOverview } from "@/components/dashboard/goals-overview"
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
        <EmptyDashboard name={session.user.name} />
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
        <GoalsOverview goals={data.goals as any} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <QuickActions />
        <AchievementsBadge userId={session.user.id} />
      </div>
    </div>
    </AppContent>
  )
}

function EmptyDashboard({ name }: { name?: string | null }) {
  const firstName = name?.split(" ")[0] || "there"

  return (
    <div className="relative flex flex-col items-center justify-center text-center py-20 space-y-6">
      <MandalaWatermark position="center" size="lg" />

      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
        <Compass className="h-10 w-10 text-accent" />
      </div>

      <div className="space-y-2 max-w-md">
        <h1 className="font-display text-3xl font-semibold">
          Welcome, {firstName}
        </h1>
        <p className="text-muted-foreground text-lg">
          Your journey begins here. Create your first yearly plan to start
          living with intention and clarity.
        </p>
      </div>

      <OrnamentDivider variant="lotus" />

      <blockquote className="max-w-sm italic text-muted-foreground text-sm">
        &ldquo;A year from now, you will wish you had started today.&rdquo;
        <footer className="mt-1 font-medium not-italic text-foreground/70">
          — Karen Lamb
        </footer>
      </blockquote>

      <Button size="lg" asChild className="px-10 mt-2">
        <Link href="/plan/new">
          <Sparkles className="mr-2 h-4 w-4" /> Create Your Plan
        </Link>
      </Button>
    </div>
  )
}
