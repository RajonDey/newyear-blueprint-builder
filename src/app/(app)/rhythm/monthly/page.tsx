import type { Metadata } from "next"
import { requireAuth } from "@/lib/auth-guard"
import { db } from "@/lib/db"
import { PremiumGate } from "@/components/shared/premium-gate"
import { MonthlyReviewForm } from "@/components/check-in/monthly-review-form"
import { hasProProductAccess } from "@/lib/plan-access"

export const metadata: Metadata = { title: "Monthly Review" }

export default async function MonthlyPage() {
  const session = await requireAuth()
  const isPro = hasProProductAccess(session.user.planTier, session.user.role)

  if (!isPro) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold">Monthly Review</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            A tactical zoom-out. Look back at the last 4 weeks and reset before the quarter closes.
          </p>
        </div>
        <PremiumGate isPremium={false} featureName="Monthly Review" />
      </div>
    )
  }

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

  return <MonthlyReviewForm data={data} />
}
