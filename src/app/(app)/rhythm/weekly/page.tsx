import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { CalendarCheck, Sparkles } from "lucide-react"
import { requireAuth } from "@/lib/auth-guard"
import { EmptyState } from "@/components/shared/empty-state"
import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"
import {
  getWeeklyWorkspaceData,
  getWeeklyWorkspaceDataForWeek,
} from "@/lib/queries/weekly-workspace"
import {
  getIsoWeekContextInTimeZone,
  getPreviousIsoWeekContext,
  getNextIsoWeekContext,
} from "@/lib/utils"
import { db } from "@/lib/db"
import { WeeklyCheckInForm } from "@/components/check-in/weekly-check-in-form"
import { WeeklyPlanForm } from "@/components/check-in/weekly-plan-form"
import { CadenceWorkspace } from "@/components/rhythm/cadence-workspace"
import { WeeklyWorkspaceSidebar } from "@/components/check-in/weekly-workspace-sidebar"
import { WeekNavigator } from "@/components/check-in/week-navigator"
import { WeeklyPastView } from "@/components/check-in/weekly-past-view"
import { Button } from "@/components/ui/button"
import { RhythmWorkspaceShell } from "@/components/rhythm/rhythm-workspace-shell"
import { WeeklyHistoryStrip } from "@/components/rhythm/weekly-history-strip"
import { getRhythmStats } from "@/lib/queries/rhythm-stats"

export const metadata: Metadata = { title: "Weekly Planner" }

function WeeklyTabsFallback() {
  return (
    <div className="w-full space-y-4" aria-busy="true">
      <div className="grid h-10 w-full max-w-md grid-cols-2 gap-1 rounded-md bg-muted/80 animate-pulse" />
      <div className="min-h-[240px] rounded-lg border border-dashed bg-muted/20" />
    </div>
  )
}

export default async function WeeklyPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; year?: string; tab?: string }>
}) {
  const session = await requireAuth()
  const params = await searchParams

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { timezone: true },
  })
  const now = new Date()
  const currentWeek = getIsoWeekContextInTimeZone(now, user?.timezone || "UTC")

  const requestedWeek = params.week ? parseInt(params.week, 10) : null
  const requestedYear = params.year ? parseInt(params.year, 10) : null
  const hasValidParams =
    requestedWeek !== null &&
    requestedYear !== null &&
    !isNaN(requestedWeek) &&
    !isNaN(requestedYear)

  const isCurrentWeek =
    !hasValidParams ||
    (requestedWeek === currentWeek.weekNumber && requestedYear === currentWeek.year)

  const data = isCurrentWeek
    ? await getWeeklyWorkspaceData(session.user.id)
    : await getWeeklyWorkspaceDataForWeek(
        session.user.id,
        requestedWeek!,
        requestedYear!
      )

  if (!data) {
    return (
      <PageContainer width="wide">
        <PageHeader
          eyebrow="Rhythm · Weekly"
          title="Weekly planner"
          description="Each week you'll set priorities, protect what matters, then reflect and carry a note into the next week."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
          {[
            { label: "Plan", desc: "Pick priority projects and commitments for the week" },
            { label: "Review", desc: "Rate each project, note blockers, and set next-week focus" },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-dashed p-4">
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
        <EmptyState
          icon={CalendarCheck}
          title="Create your plan to get started"
          description="A guided 15-minute process to set projects and build your weekly rhythm."
          action={
            <Button asChild>
              <Link href="/onboarding">
                <Sparkles className="mr-2 h-4 w-4" /> Create your plan (~15 min)
              </Link>
            </Button>
          }
        />
      </PageContainer>
    )
  }

  const wk = data.weekNumber
  const yr = data.year
  const prevWeek = getPreviousIsoWeekContext(wk, yr)
  const nextWeek = getNextIsoWeekContext(wk, yr)
  const rhythmStats = await getRhythmStats(session.user.id)
  const recentWeeks = rhythmStats?.weeklyConsistency.slice(-5) ?? []

  const sidebar = (
    <WeeklyWorkspaceSidebar
      weekNumber={wk}
      year={yr}
      isCurrentWeek={data.isCurrentWeek}
      suggestionFromLastWeek={data.suggestionFromLastWeek}
      weeklyPlan={data.weeklyPlan}
      existingCheckIn={data.existingCheckIn}
      projects={data.projects}
      weeklyConsistency={rhythmStats?.weeklyConsistency}
      weekConsistencyPct={rhythmStats?.weekConsistencyPct}
    />
  )

  return (
    <PageContainer width="wide" className="space-y-4">
      <PageHeader
        eyebrow="Rhythm · Weekly"
        title="Weekly planner"
        description={
          data.isCurrentWeek
            ? "Plan your week, then close it with a short review."
            : `Viewing week ${wk} of ${yr}.`
        }
        actions={
          <WeekNavigator
            weekNumber={wk}
            year={yr}
            isCurrentWeek={data.isCurrentWeek}
            prevWeek={prevWeek}
            nextWeek={nextWeek}
            currentWeek={currentWeek}
          />
        }
      />

      {data.isCurrentWeek && recentWeeks.length > 0 && (
        <WeeklyHistoryStrip
          weeks={recentWeeks}
          currentWeekNumber={wk}
          currentYear={yr}
        />
      )}

      <RhythmWorkspaceShell sidebar={sidebar}>
        {data.isCurrentWeek ? (
          <Suspense fallback={<WeeklyTabsFallback />}>
            <CadenceWorkspace
              cadence="weekly"
              planTab={
                <WeeklyPlanForm
                  planId={data.plan.id}
                  planYear={data.plan.year}
                  projects={data.projects}
                  weekNumber={data.weekNumber}
                  year={data.year}
                    initialPlan={data.weeklyPlan}
                    suggestionFromLastWeek={data.suggestionFromLastWeek}
                    monthlyFocus={data.monthlyFocus}
                  />
              }
              reviewTab={<WeeklyCheckInForm data={data} embedded />}
            />
          </Suspense>
        ) : (
          <WeeklyPastView
            data={{
              projects: data.projects,
              weeklyPlan: data.weeklyPlan,
              existingCheckIn: data.existingCheckIn,
            }}
          />
        )}
      </RhythmWorkspaceShell>
    </PageContainer>
  )
}
