import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { requireAuth } from "@/lib/auth-guard"
import { AppContent } from "@/components/shared/app-content"
import { MandalaWatermark } from "@/components/shared/mandala-watermark"
import { OrnamentDivider } from "@/components/shared/ornament-divider"
import { getWeeklyWorkspaceData } from "@/lib/queries/weekly-workspace"
import { WeeklyCheckInForm } from "@/components/check-in/weekly-check-in-form"
import { WeeklyPlanForm } from "@/components/check-in/weekly-plan-form"
import { WeeklyWorkspaceTabs } from "@/components/check-in/weekly-workspace-tabs"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = { title: "Weekly rhythm" }

function WeeklyTabsFallback() {
  return (
    <div className="w-full space-y-4" aria-busy="true">
      <div className="grid h-10 w-full max-w-md grid-cols-2 gap-1 rounded-md bg-muted/80 animate-pulse" />
      <div className="min-h-[240px] rounded-lg border border-dashed bg-muted/20" />
    </div>
  )
}

export default async function WeeklyCheckInPage() {
  const session = await requireAuth()
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
      </div>
    </AppContent>
  )
}
