import type { Metadata } from "next"
import { requireAuth } from "@/lib/auth-guard"
import { PageContainer } from "@/components/shared/page-container"
import { hasProProductAccess } from "@/lib/plan-access"
import { PageHeader } from "@/components/shared/page-header"
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard"
import { getAnalyticsData } from "@/lib/queries/analytics"
import { ProGate } from "@/components/upgrade/pro-gate"

export const metadata: Metadata = { title: "Analytics" }

export default async function AnalyticsPage() {
  const session = await requireAuth()
  const isPro = hasProProductAccess(session.user.planTier, session.user.role)

  if (!isPro) {
    return (
      <PageContainer>
        <ProGate
          planTier={session.user.planTier}
          role={session.user.role}
          feature="Progress analytics"
          description="See the patterns hiding in your weeks — mood trend, project trajectories, wheel drift over time, and the rhythms that quietly compound."
          bullets={[
            "Mood + energy trend lines (from daily and weekly check-ins)",
            "Per-project rating across all your check-ins",
            "Wheel of Life snapshots — see your year evolve",
            "Quarterly review aggregates",
          ]}
        >
          {null}
        </ProGate>
      </PageContainer>
    )
  }

  const data = await getAnalyticsData(session.user.id)

  return (
    <PageContainer width="wide">
      <PageHeader
        title="Analytics"
        description={
          data
            ? `Your ${data.plan.year} progress at a glance — daily signals, weekly rhythm, and the patterns that compound quietly.`
            : "Your progress at a glance — daily signals, weekly rhythm, and the patterns that compound quietly."
        }
      />
      <AnalyticsDashboard initialData={data} />
    </PageContainer>
  )
}
