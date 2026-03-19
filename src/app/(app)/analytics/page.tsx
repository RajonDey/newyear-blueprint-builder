import type { Metadata } from "next"
import { requireAuth } from "@/lib/auth-guard"
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard"
import { PremiumGate } from "@/components/shared/premium-gate"

export const metadata: Metadata = { title: "Analytics" }

export default async function AnalyticsPage() {
  const session = await requireAuth()

  return (
    <PremiumGate
      isPremium={session.user.planTier === "PRO"}
      featureName="Analytics"
    >
      <AnalyticsDashboard />
    </PremiumGate>
  )
}
