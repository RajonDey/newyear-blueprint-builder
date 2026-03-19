import type { Metadata } from "next"
import { requireAuth } from "@/lib/auth-guard"
import { WizardShell } from "@/components/wizard/wizard-shell"

export const metadata: Metadata = { title: "Create Your Plan" }

export default async function NewPlanPage() {
  await requireAuth()

  return <WizardShell />
}
