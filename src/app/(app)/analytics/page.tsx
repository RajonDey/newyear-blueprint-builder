import type { Metadata } from "next"
import { requireAuth } from "@/lib/auth-guard"
import { AppContent } from "@/components/shared/app-content"
import { hasProProductAccess } from "@/lib/plan-access"
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard"
import { PremiumGate } from "@/components/shared/premium-gate"

export const metadata: Metadata = { title: "Analytics" }

export default async function AnalyticsPage() {
  const session = await requireAuth()

  return (
    <AppContent variant="wide">
      <PremiumGate
        isPremium={hasProProductAccess(
          session.user.planTier,
          session.user.role
        )}
        featureName="Progress analytics"
      >
        <AnalyticsDashboard />
      </PremiumGate>
    </AppContent>
  )
}
