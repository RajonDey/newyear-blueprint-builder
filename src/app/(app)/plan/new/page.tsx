import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth-guard"
import { db } from "@/lib/db"
import { WizardShell } from "@/components/wizard/wizard-shell"

export const metadata: Metadata = { title: "Create Your Plan" }

export default async function NewPlanPage() {
  const session = await requireAuth()

  const plan = await db.yearlyPlan.findFirst({
    where: { userId: session.user.id, status: "ACTIVE" },
  })

  // Force the icebreaker if they completely skipped the dashboard
  if (!plan) {
    redirect("/dashboard")
  }

  return <WizardShell />
}
