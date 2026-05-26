import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { requireAuth } from "@/lib/auth-guard"
import { EmptyState } from "@/components/shared/empty-state"
import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"
import { hasProProductAccess } from "@/lib/plan-access"
import { getQuarterlyReviewData } from "@/lib/queries/quarterly"
import { QuarterlyWorkspace } from "@/components/check-in/quarterly-workspace"
import { QuarterlyWorkspaceSidebar } from "@/components/check-in/quarterly-workspace-sidebar"
import { getReviewTemplateFields } from "@/lib/review-templates"
import { ProGate } from "@/components/upgrade/pro-gate"
import { Button } from "@/components/ui/button"
import { RhythmWorkspaceShell } from "@/components/rhythm/rhythm-workspace-shell"
import { cadencePlanHasContent } from "@/lib/cadence-plan-utils"
import { parseQuarterParam } from "@/lib/quarters"
import { Activity, Sparkles } from "lucide-react"

export const metadata: Metadata = { title: "Quarterly Planner" }

function QuarterlyTabsFallback() {
  return (
    <div className="w-full space-y-4" aria-busy="true">
      <div className="grid h-10 w-full max-w-xl grid-cols-2 gap-1 rounded-md bg-muted/80 animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-muted/60 animate-pulse" />
        ))}
      </div>
      <div className="min-h-[240px] rounded-lg border border-dashed bg-muted/20" />
    </div>
  )
}

export default async function QuarterlyPage({
  searchParams,
}: {
  searchParams: Promise<{ quarter?: string; tab?: string }>
}) {
  const session = await requireAuth()
  const params = await searchParams
  const initialQuarter = parseQuarterParam(params.quarter)
  const isPro = hasProProductAccess(session.user.planTier, session.user.role)

  if (!isPro) {
    return (
      <PageContainer width="wide">
        <PageHeader
          eyebrow="Rhythm · Quarterly"
          title="Quarterly planner"
          description="Plan the quarter ahead, then review the season."
        />
        <ProGate
          planTier={session.user.planTier}
          role={session.user.role}
          feature="Quarterly Planner"
          description="Set a focus theme and project intentions at the start of each quarter, then review wins and friction at season-end. Plans cascade into your monthly rhythm."
          bullets={[
            "Quarter focus theme for monthly planning",
            "Per-project seasonal intentions",
            "Wheel of life + project health review",
            "Past seasons timeline",
          ]}
        >
          {null}
        </ProGate>
      </PageContainer>
    )
  }

  const [data, templateFields] = await Promise.all([
    getQuarterlyReviewData(session.user.id),
    getReviewTemplateFields(session.user.id, "QUARTERLY"),
  ])

  if (!data) {
    return (
      <PageContainer width="wide">
        <PageHeader
          eyebrow="Rhythm · Quarterly"
          title="Quarterly planner"
          description="Plan each quarter forward, then zoom out — reassess projects, celebrate wins, and adjust for the next season."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
          {[
            { label: "Plan", desc: "Set focus and intentions" },
            { label: "Review", desc: "Reset project health and reflect" },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-dashed p-4">
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
        <EmptyState
          icon={Activity}
          title="Create your plan to get started"
          description="A guided 15-minute process to set projects and build your quarterly rhythm."
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

  const reviewedCount = data.reviews.length
  const plannedCount = data.quarterlyPlans.filter((p) =>
    cadencePlanHasContent({
      quarterFocus: p.quarterFocus,
      projectIntentions: p.projectIntentions,
      topIntentions: p.topIntentions,
    }),
  ).length

  const plans = data.quarterlyPlans.map((p) => ({
    quarter: p.quarter,
    year: p.year,
    quarterFocus: p.quarterFocus,
    projectIntentions: p.projectIntentions,
    topIntentions: p.topIntentions,
  }))

  return (
    <PageContainer width="wide">
      <PageHeader
        eyebrow="Rhythm · Quarterly"
        title="Quarterly planner"
        description={`${plannedCount} planned · ${reviewedCount} reviewed — set intentions, then reflect at season-end.`}
      />
      <RhythmWorkspaceShell
        sidebar={
          <QuarterlyWorkspaceSidebar
            year={data.plan.year}
            reviewedCount={reviewedCount}
            plannedCount={plannedCount}
            projects={data.projects}
            wheelScores={data.wheelScores}
            previousQuarterWheel={data.previousQuarterWheel}
            reviews={data.reviews}
            plans={plans}
          />
        }
      >
        <Suspense fallback={<QuarterlyTabsFallback />}>
          <QuarterlyWorkspace
            data={data}
            plans={plans}
            templateFields={templateFields}
            initialQuarter={initialQuarter}
          />
        </Suspense>
      </RhythmWorkspaceShell>
    </PageContainer>
  )
}
