import type { Metadata } from "next"
import { requireAuth } from "@/lib/auth-guard"
import { getQuarterlyReviewData } from "@/lib/queries/quarterly"
import { QuarterlyReviewForm } from "@/components/check-in/quarterly-review-form"
import { PremiumGate } from "@/components/shared/premium-gate"

export const metadata: Metadata = { title: "Quarterly Review" }

export default async function QuarterlyReviewPage() {
  const session = await requireAuth()

  if (session.user.planTier !== "PRO") {
    return (
      <PremiumGate
        isPremium={false}
        featureName="Quarterly Review"
      />
    )
  }

  const data = await getQuarterlyReviewData(session.user.id)

  if (!data) {
    return (
      <div className="max-w-2xl space-y-8">
        <h1 className="font-display text-3xl font-semibold">
          Quarterly Review
        </h1>
        <p className="text-muted-foreground">
          Create your yearly plan first to start quarterly reflections.
        </p>
        <a
          href="/plan/new"
          className="inline-flex items-center gap-2 text-accent hover:underline font-medium"
        >
          Create your plan →
        </a>
      </div>
    )
  }

  return <QuarterlyReviewForm data={data} />
}
