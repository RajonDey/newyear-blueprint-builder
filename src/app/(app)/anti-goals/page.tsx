import type { Metadata } from "next"
import { requireAuth } from "@/lib/auth-guard"
import { db } from "@/lib/db"
import { planLimits } from "@/lib/config"
import { hasProProductAccess } from "@/lib/plan-access"
import { AppContent } from "@/components/shared/app-content"
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
    <AppContent variant="wide">
      <AntiGoalsList
        initial={items}
        cap={cap}
        isPro={isPro}
        hasActivePlan={Boolean(plan)}
      />
    </AppContent>
  )
}
