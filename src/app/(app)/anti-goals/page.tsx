import type { Metadata } from "next"
import { requireAuth } from "@/lib/auth-guard"
import { db } from "@/lib/db"
import { planLimits } from "@/lib/config"
import { hasProProductAccess } from "@/lib/plan-access"
import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"
import { AntiGoalsList } from "@/components/anti-goals/anti-goals-list"

export const metadata: Metadata = { title: "Anti-goals" }

export default async function AntiGoalsPage() {
  const session = await requireAuth()

  const plan = await db.yearlyPlan.findFirst({
    where: { userId: session.user.id, status: "ACTIVE" },
    select: { id: true },
  })

  const items = plan
    ? await db.antiGoal.findMany({
        where: { planId: plan.id },
        orderBy: { id: "asc" },
      })
    : []

  const cap = planLimits[session.user.planTier].maxAntiGoalsPerPlan
  const isPro = hasProProductAccess(session.user.planTier, session.user.role)

  return (
    <PageContainer>
      <PageHeader
        title="The quiet noes that protect the year"
        description="Year-level guardrails — what you won't chase so the real yeses have room. Today shows one rotating pill; this page is where you manage them all."
      />
      <AntiGoalsList
        initial={items}
        cap={cap}
        isPro={isPro}
        hasActivePlan={Boolean(plan)}
      />
    </PageContainer>
  )
}
