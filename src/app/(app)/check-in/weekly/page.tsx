import type { Metadata } from "next"
import Link from "next/link"
import { requireAuth } from "@/lib/auth-guard"
import { AppContent } from "@/components/shared/app-content"
import { MandalaWatermark } from "@/components/shared/mandala-watermark"
import { OrnamentDivider } from "@/components/shared/ornament-divider"
import { getWeeklyWorkspaceData } from "@/lib/queries/weekly-workspace"
import { WeeklyCheckInForm } from "@/components/check-in/weekly-check-in-form"
import { WeeklyPlanForm } from "@/components/check-in/weekly-plan-form"
import {
  parseWeeklyWorkspaceTab,
  WeeklyWorkspaceTabs,
} from "@/components/check-in/weekly-workspace-tabs"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = { title: "Weekly rhythm" }

export default async function WeeklyCheckInPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const session = await requireAuth()
  const { tab } = await searchParams
  const workspaceTab = parseWeeklyWorkspaceTab(tab)
  const data = await getWeeklyWorkspaceData(session.user.id)

  if (!data) {
    return (
      <AppContent variant="narrow">
        <div className="relative w-full space-y-8">
          <MandalaWatermark position="top-right" size="sm" />
          <div>
            <h1 className="font-display text-3xl font-semibold">
              Weekly rhythm
            </h1>
            <p className="text-muted-foreground mt-1">
              Create your yearly plan first to plan and review each week.
            </p>
          </div>
          <OrnamentDivider variant="lotus" />
          <Button asChild>
            <Link href="/plan/new">Create your plan</Link>
          </Button>
        </div>
      </AppContent>
    )
  }

  return (
    <AppContent variant="narrow">
      <div className="relative w-full space-y-6">
        <MandalaWatermark position="top-right" size="sm" />
        <div>
          <h1 className="font-display text-3xl font-semibold">Weekly rhythm</h1>
          <p className="text-muted-foreground mt-1">
            Week {data.weekNumber} of {data.year} — plan your week, then reflect.
          </p>
        </div>
        <OrnamentDivider variant="lotus" />
        <WeeklyWorkspaceTabs
          defaultTab={workspaceTab}
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
          reviewSlot={
            <WeeklyCheckInForm data={data} embedded />
          }
        />
      </div>
    </AppContent>
  )
}
