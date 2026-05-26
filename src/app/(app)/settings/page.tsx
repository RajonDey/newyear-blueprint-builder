import type { Metadata } from "next"
import { requireAuth } from "@/lib/auth-guard"
import { PageContainer } from "@/components/shared/page-container"
import { SettingsForm } from "@/components/settings/settings-form"
import { db } from "@/lib/db"
import { getYearlyPlanSettingsData } from "@/lib/queries/yearly-plan"
import {
  getEmailPreferences,
  parseUserPreferences,
} from "@/lib/user-preferences"
import type { PlanTierKey } from "@/lib/config"

export const metadata: Metadata = { title: "Settings" }

export default async function SettingsPage() {
  const session = await requireAuth()

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      timezone: true,
      preferences: true,
    },
  })

  const emailPreferences = getEmailPreferences(
    parseUserPreferences(user?.preferences),
  )

  const yearlyPlan = await getYearlyPlanSettingsData(
    session.user.id,
    session.user.planTier as PlanTierKey,
  )

  return (
    <PageContainer width="narrow">
      <SettingsForm
        planTier={session.user.planTier}
        initialUser={user ?? undefined}
        initialEmailPreferences={emailPreferences}
        yearlyPlan={yearlyPlan}
      />
    </PageContainer>
  )
}
