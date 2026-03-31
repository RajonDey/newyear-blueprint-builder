import type { Metadata } from "next"
import Link from "next/link"
import { requireAuth } from "@/lib/auth-guard"
import { EmptyState } from "@/components/shared/empty-state"
import { hasProProductAccess } from "@/lib/plan-access"
import { getQuarterlyReviewData } from "@/lib/queries/quarterly"
import { QuarterlyReviewForm } from "@/components/check-in/quarterly-review-form"
import { PremiumGate } from "@/components/shared/premium-gate"
import { Button } from "@/components/ui/button"
import { Activity, Sparkles } from "lucide-react"

export const metadata: Metadata = { title: "Quarterly Review" }

export default async function QuarterlyPage() {
  const session = await requireAuth()
  const isPro = hasProProductAccess(session.user.planTier, session.user.role)

  if (!isPro) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold">Quarterly Review</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Every 3 months, zoom out — reassess each goal, celebrate wins, and
            adjust your plan for the next quarter.
          </p>
        </div>
        <PremiumGate isPremium={false} featureName="Quarterly Review" />
      </div>
    )
  }

  const data = await getQuarterlyReviewData(session.user.id)

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold">Quarterly Review</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Every 3 months, zoom out — reassess each goal, celebrate wins, and
            adjust your plan for the next quarter.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 max-w-md">
          {[
            { label: "Goal health check", desc: "Mark each goal as on-track, at-risk, or completed" },
            { label: "Course correct", desc: "Drop what isn't working, double down on what is" },
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
          description="A guided 15-minute process to set goals and build your quarterly review rhythm."
          action={
            <Button asChild>
              <Link href="/plan/new">
                <Sparkles className="mr-2 h-4 w-4" /> Create your plan (~15 min)
              </Link>
            </Button>
          }
        />
      </div>
    )
  }

  return <QuarterlyReviewForm data={data} />
}
