import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Compass, Sparkles, Target } from "lucide-react"
import { requireAuth } from "@/lib/auth-guard"
import { getDashboardData } from "@/lib/queries/dashboard"
import { getAreasForUser } from "@/lib/queries/areas"
import { getWeekOneChecklist } from "@/lib/queries/week-one-checklist"
import { getDriftInboxForUser } from "@/lib/queries/drifts"
import { db } from "@/lib/db"
import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"
import { TodayCard } from "@/components/dashboard/today-card"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { WheelChart } from "@/components/dashboard/wheel-chart"
import { ProjectsOverview } from "@/components/dashboard/projects-overview"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { AchievementsBadge } from "@/components/dashboard/achievements-badge"
import { DriftInboxCard } from "@/components/dashboard/drift-inbox-card"
import { WeekOneChecklistCard } from "@/components/dashboard/week-one-checklist-card"
import { VisionProjectsStrip } from "@/components/dashboard/vision-projects-strip"
import { AreasPulse } from "@/components/dashboard/areas-pulse"
import { ScrollToTodayAnchor } from "@/components/dashboard/scroll-to-today-anchor"
import { NoActiveYearPanel } from "@/components/dashboard/no-active-year-panel"
import { DAILY_HOME_HREF } from "@/lib/app-routes"

export const metadata: Metadata = { title: "Dashboard" }

export default async function DashboardPage() {
  const session = await requireAuth()
  const [data, driftInbox, projectList, areaList, weekOneChecklist, areasPulse] =
    await Promise.all([
    getDashboardData(session.user.id),
    getDriftInboxForUser(session.user.id, 12),
    db.project.findMany({
      where: { plan: { userId: session.user.id, status: "ACTIVE" } },
      select: { id: true, title: true },
      orderBy: { sortOrder: "asc" },
    }),
    db.area.findMany({
      where: { userId: session.user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    getWeekOneChecklist(session.user.id),
    getAreasForUser(session.user.id),
  ])

  if (!data) {
    const planCount = await db.yearlyPlan.count({
      where: { userId: session.user.id },
    })
    if (planCount === 0) {
      redirect("/onboarding")
    }

    const firstName = session.user.name?.split(" ")[0] || "there"
    return (
      <PageContainer width="wide" spacing="default">
        <PageHeader
          eyebrow="Year archived"
          title={`Welcome back, ${firstName}`}
          description="Your previous year is wrapped up. Start fresh when you're ready."
        />
        <NoActiveYearPanel />
      </PageContainer>
    )
  }

  const planEyebrow = [
    `Week ${data.currentWeek}`,
    data.currentQuarter,
    String(data.plan.year),
    data.plan.theme,
  ]
    .filter(Boolean)
    .join(" · ")

  const firstName = session.user.name?.split(" ")[0] || "there"
  const hasCheckInThisWeek =
    data.lastCheckIn?.weekNumber === data.currentWeek
  const hasOpenSystems =
    data.systemsToday.total > 0 &&
    data.systemsToday.completed < data.systemsToday.total
  const hasGoals = data.projectStats.total > 0

  const primaryAction = !hasGoals
    ? {
        label: "Add projects to your plan",
        href: "/projects",
        icon: Sparkles,
        description:
          "Areas → Projects → Tasks. Start with one project per Area you care about.",
      }
    : !hasCheckInThisWeek
      ? {
          label: "Complete this week's review",
          href: "/rhythm/weekly?tab=review",
          icon: Compass,
          description:
            "Close the loop and carry a focused note into next week.",
        }
      : hasOpenSystems
        ? {
            label: "Complete today's habits",
            href: DAILY_HOME_HREF,
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
    <PageContainer width="wide" spacing="default">
      <ScrollToTodayAnchor />
      <PageHeader
        eyebrow={planEyebrow}
        title={`Welcome back, ${firstName}`}
        description="Your year at a glance — small reps today keep the long arc alive."
      />

      <WeekOneChecklistCard initial={weekOneChecklist} />

      <VisionProjectsStrip
        linkedMilestoneCount={data.visionLinkSummary.linkedMilestoneCount}
      />

      <AreasPulse areas={areasPulse} />

      <TodayCard
        systems={data.todaySystemsList}
        todayYmd={data.todayYmd}
        planYear={data.plan.year}
        planTheme={data.plan.theme}
        prompt={data.todayPrompt}
        initialState={data.dailyState}
        rotatingAntiGoal={data.rotatingAntiGoal}
        antiGoalCount={data.antiGoalCount}
        weeklyPriorityProjects={data.weeklyPriorities.projects}
        currentWeekNumber={data.weeklyPriorities.weekNumber}
      />

      <DriftInboxCard
        total={driftInbox.total}
        rows={driftInbox.rows}
        projects={projectList}
        areas={areaList}
      />

      <StatsCards
        projectStats={data.projectStats}
        streak={data.streak}
        systemsToday={data.systemsToday}
        currentQuarter={data.currentQuarter}
        trends={data.trends}
        weeklyPriorityCount={data.weeklyPriorities.priorityProjectIds.length}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <WheelChart scores={data.wheelScores} />
        {hasGoals ? (
          <ProjectsOverview
            projects={data.projects}
            planYear={data.plan.year}
            priorityProjectIds={data.weeklyPriorities.priorityProjectIds}
          />
        ) : (
          <EmptyProjectsCard />
        )}
      </div>

      {data.achievements.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <QuickActions primaryAction={primaryAction} />
          <AchievementsBadge achievements={data.achievements} />
        </div>
      ) : (
        <QuickActions primaryAction={primaryAction} />
      )}
    </PageContainer>
  )
}

function EmptyProjectsCard() {
  return (
    <section className="rounded-2xl border border-dashed border-border bg-card/40 p-6">
      <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase text-amber">
        <Target className="h-3 w-3" />
        Plan · Empty
      </div>
      <h3 className="font-display text-xl tracking-tight mt-1.5">
        Your plan is waiting for a project
      </h3>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
        Open the Projects page and add the first thing you want to move on this
        year. One per Area is plenty to start.
      </p>
      <Link
        href="/projects"
        className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-foreground text-background px-3 py-1.5 text-sm font-medium hover:opacity-90 transition-opacity"
      >
        <Compass className="h-3.5 w-3.5" />
        Open Projects
      </Link>
    </section>
  )
}
