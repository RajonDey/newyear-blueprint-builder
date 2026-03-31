import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { requireAuth } from "@/lib/auth-guard"
import { EmptyState } from "@/components/shared/empty-state"
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
import { WeeklyWorkspaceTabs } from "@/components/check-in/weekly-workspace-tabs"
import { WeekNavigator } from "@/components/check-in/week-navigator"
import { WeeklyPastView } from "@/components/check-in/weekly-past-view"
import { Button } from "@/components/ui/button"
import { CalendarCheck, Sparkles } from "lucide-react"

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
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold">Weekly Planner</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Each week you&apos;ll set priorities, protect what matters, then reflect
            and carry a note into the next week.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 max-w-md">
          {[
            { label: "Plan", desc: "Pick priority goals and commitments for the week" },
            { label: "Review", desc: "Rate each goal, note blockers, and set next-week focus" },
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
          description="A guided 15-minute process to set goals and build your weekly rhythm."
          action={
            <Button asChild>
              <Link href="/plan/new">
                <Sparkles className="mr-2 h-4 w-4" /> Create your plan (~15 min)
              </Link>
            </Button>
          }
        />
      </div>
    )
  }

  const wk = data.weekNumber
  const yr = data.year
  const prevWeek = getPreviousIsoWeekContext(wk, yr)
  const nextWeek = getNextIsoWeekContext(wk, yr)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="font-display text-2xl font-semibold">Weekly Planner</h1>
        <WeekNavigator
          weekNumber={wk}
          year={yr}
          isCurrentWeek={data.isCurrentWeek}
          prevWeek={prevWeek}
          nextWeek={nextWeek}
          currentWeek={currentWeek}
        />
      </div>

      {data.isCurrentWeek ? (
        <Suspense fallback={<WeeklyTabsFallback />}>
          <WeeklyWorkspaceTabs
            planSlot={
              <WeeklyPlanForm
                planId={data.plan.id}
                planYear={data.plan.year}
                goals={data.goals}
                weekNumber={data.weekNumber}
                year={data.year}
                initialPlan={data.weeklyPlan}
                suggestionFromLastWeek={data.suggestionFromLastWeek}
              />
            }
            reviewSlot={<WeeklyCheckInForm data={data} embedded />}
          />
        </Suspense>
      ) : (
        <WeeklyPastView
          data={{
            goals: data.goals,
            weeklyPlan: data.weeklyPlan,
            existingCheckIn: data.existingCheckIn,
          }}
        />
      )}
    </div>
  )
}
