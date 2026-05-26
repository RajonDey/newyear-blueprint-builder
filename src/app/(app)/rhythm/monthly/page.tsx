import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { CalendarDays, Sparkles } from "lucide-react"
import { requireAuth } from "@/lib/auth-guard"
import { db } from "@/lib/db"
import { ProGate } from "@/components/upgrade/pro-gate"
import { MonthlyWorkspace } from "@/components/check-in/monthly-workspace"
import { MonthlyWorkspaceSidebar } from "@/components/check-in/monthly-workspace-sidebar"
import { EmptyState } from "@/components/shared/empty-state"
import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"
import { RhythmWorkspaceShell, rhythmWorkspacePageClass } from "@/components/rhythm/rhythm-workspace-shell"
import { Button } from "@/components/ui/button"
import { hasProProductAccess } from "@/lib/plan-access"
import { getReviewTemplateFields } from "@/lib/review-templates"
import {
  getCurrentQuarter,
  resolveQuarterlyFocusContext,
} from "@/lib/queries/rhythm-context"
import { parseMonthParam } from "@/lib/months"
import { cadencePlanHasContent } from "@/lib/cadence-plan-utils"

export const metadata: Metadata = { title: "Monthly Planner" }

function MonthlyTabsFallback() {
  return (
    <div className="w-full space-y-4" aria-busy="true">
      <div className="h-8 w-full rounded-md bg-muted/80 animate-pulse" />
      <div className="grid h-10 w-full max-w-xl grid-cols-2 gap-1 rounded-md bg-muted/80 animate-pulse" />
      <div className="min-h-[240px] rounded-lg border border-dashed bg-muted/20" />
    </div>
  )
}

export default async function MonthlyPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; tab?: string }>
}) {
  const session = await requireAuth()
  const params = await searchParams
  const initialMonth = parseMonthParam(params.month)

  const isPro = hasProProductAccess(session.user.planTier, session.user.role)

  if (!isPro) {
    return (
      <PageContainer width="wide">
        <PageHeader
          title="Monthly planner"
          description="Plan the month ahead, then review what happened."
        />
        <ProGate
          planTier={session.user.planTier}
          role={session.user.role}
          feature="Monthly Planner"
          description="Set a focus theme and project intentions at the start of each month, then review wins and friction at the end. Plans cascade into your weekly rhythm."
          bullets={[
            "Month focus theme for weekly planning",
            "Per-project monthly intentions",
            "Wins / challenges / adjustments review",
            "Carry one focus into the next month",
          ]}
        >
          {null}
        </ProGate>
      </PageContainer>
    )
  }

  const year = new Date().getFullYear()
  const plan = await db.yearlyPlan.findUnique({
    where: { userId_year: { userId: session.user.id, year } },
    include: {
      projects: true,
      monthlyReviews: true,
      monthlyPlans: true,
    },
  })

  if (!plan) {
    return (
      <PageContainer width="wide">
        <PageHeader
          title="Monthly planner"
          description="Plan each month forward, then look back — celebrate wins, name friction, and adjust for the next four weeks."
        />
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-3">
          {[
            { label: "Plan", desc: "Set focus and intentions" },
            { label: "Execute", desc: "Weekly plans carry it forward" },
            { label: "Review", desc: "Reflect and recalibrate" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-dashed p-3 text-center"
            >
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
        <EmptyState
          icon={CalendarDays}
          title="Create your plan to get started"
          description="A guided 15-minute process to set projects and build your monthly rhythm."
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

  const currentQuarter = getCurrentQuarter()

  const [templateFields, quarterlyReview, quarterlyPlan] = await Promise.all([
    getReviewTemplateFields(session.user.id, "MONTHLY"),
    db.quarterlyReview.findUnique({
      where: {
        planId_quarter: { planId: plan.id, quarter: currentQuarter },
      },
      select: {
        summary: true,
        winsText: true,
        challengesText: true,
        adjustments: true,
        responses: true,
      },
    }),
    db.quarterlyPlan.findUnique({
      where: {
        planId_quarter: { planId: plan.id, quarter: currentQuarter },
      },
      select: {
        quarterFocus: true,
        topIntentions: true,
      },
    }),
  ])

  const reviewedCount = plan.monthlyReviews.length
  const plannedCount = plan.monthlyPlans.filter((p) =>
    cadencePlanHasContent({
      monthFocus: p.monthFocus,
      projectIntentions: p.projectIntentions,
      topIntentions: p.topIntentions,
    }),
  ).length

  const quarterlyContext = resolveQuarterlyFocusContext(
    quarterlyPlan,
    quarterlyReview,
    currentQuarter,
  )

  const data = {
    plan: { id: plan.id, year: plan.year },
    projects: plan.projects,
    reviews: plan.monthlyReviews,
  }

  const plans = plan.monthlyPlans.map((p) => ({
    month: p.month,
    year: p.year,
    monthFocus: p.monthFocus,
    projectIntentions: p.projectIntentions,
    topIntentions: p.topIntentions,
  }))

  return (
    <PageContainer width="wide" spacing="compact" className={rhythmWorkspacePageClass}>
      <PageHeader
        title="Monthly planner"
        description={`${plannedCount} planned · ${reviewedCount} reviewed — set intentions, then reflect at month-end.`}
      />
      <RhythmWorkspaceShell
        sidebar={
          <MonthlyWorkspaceSidebar
            year={plan.year}
            reviewedCount={reviewedCount}
            plannedCount={plannedCount}
            projects={plan.projects}
            reviews={plan.monthlyReviews}
            plans={plans}
          />
        }
      >
        <Suspense fallback={<MonthlyTabsFallback />}>
          <MonthlyWorkspace
            data={data}
            plans={plans}
            templateFields={templateFields}
            quarterlyContext={quarterlyContext}
            initialMonth={initialMonth}
          />
        </Suspense>
      </RhythmWorkspaceShell>
    </PageContainer>
  )
}
