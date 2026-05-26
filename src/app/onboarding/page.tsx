import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth-guard"
import { db } from "@/lib/db"
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"

export const metadata: Metadata = {
  title: "Welcome — Onboarding",
  description: "A 90-second start.",
}

export default async function OnboardingPage() {
  const session = await requireAuth()

  const active = await db.yearlyPlan.findFirst({
    where: { userId: session.user.id, status: "ACTIVE" },
    select: { id: true },
  })
  if (active) {
    redirect("/dashboard")
  }

  const year = new Date().getFullYear()

  const existing = await db.yearlyPlan.findUnique({
    where: { userId_year: { userId: session.user.id, year } },
    select: { id: true },
  })

  if (existing) {
    redirect("/settings#your-year")
  }

  const firstName = session.user.name?.split(" ")[0] ?? ""

  return <OnboardingWizard initialName={firstName} />
}
