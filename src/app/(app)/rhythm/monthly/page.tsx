import type { Metadata } from "next"
import { requireAuth } from "@/lib/auth-guard"
import { db } from "@/lib/db"
import { AppContent } from "@/components/shared/app-content"
import { PremiumGate } from "@/components/shared/premium-gate"
import { MonthlyReviewForm } from "@/components/check-in/monthly-review-form"
import { hasProProductAccess } from "@/lib/plan-access"

export const metadata: Metadata = { title: "Monthly Review" }

export default async function MonthlyReviewPage() {
  const session = await requireAuth()

  const year = new Date().getFullYear()
  const plan = await db.yearlyPlan.findUnique({
    where: { userId_year: { userId: session.user.id, year } },
    include: {
      goals: true,
      monthlyReviews: true,
    },
  })

  const data = {
    plan: plan ? { id: plan.id, year: plan.year } : { id: "", year },
    goals: plan?.goals || [],
    reviews: plan?.monthlyReviews || [],
  }

  const isPro = hasProProductAccess(session.user.planTier, session.user.role)

  return (
    <AppContent variant="narrow">
      <PremiumGate
        isPremium={isPro}
        featureName="Monthly Reviews"
      >
        <MonthlyReviewForm data={data} />
      </PremiumGate>
    </AppContent>
  )
}
