import type { Metadata } from "next"
import Link from "next/link"
import { requireAuth } from "@/lib/auth-guard"
import { AppContent } from "@/components/shared/app-content"
import { MandalaWatermark } from "@/components/shared/mandala-watermark"
import { OrnamentDivider } from "@/components/shared/ornament-divider"
import { hasProProductAccess } from "@/lib/plan-access"
import { getQuarterlyReviewData } from "@/lib/queries/quarterly"
import { QuarterlyReviewForm } from "@/components/check-in/quarterly-review-form"
import { PremiumGate } from "@/components/shared/premium-gate"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = { title: "Quarterly Review" }

export default async function QuarterlyReviewPage() {
  const session = await requireAuth()

  if (!hasProProductAccess(session.user.planTier, session.user.role)) {
    return (
      <AppContent variant="narrow">
        <PremiumGate
          isPremium={false}
          featureName="Quarterly review"
        />
      </AppContent>
    )
  }

  const data = await getQuarterlyReviewData(session.user.id)

  if (!data) {
    return (
      <AppContent variant="narrow">
        <div className="relative w-full space-y-8">
          <MandalaWatermark position="top-right" size="sm" />
          <div>
            <h1 className="font-display text-3xl font-semibold">
              Quarterly Review
            </h1>
            <p className="text-muted-foreground mt-1">
              Create your yearly plan first to start quarterly reflections.
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
      <QuarterlyReviewForm data={data} />
    </AppContent>
  )
}
