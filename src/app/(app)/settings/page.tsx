import type { Metadata } from "next"
import { requireAuth } from "@/lib/auth-guard"
import { AppContent } from "@/components/shared/app-content"
import { SettingsForm } from "@/components/settings/settings-form"

export const metadata: Metadata = { title: "Settings" }

export default async function SettingsPage() {
  const session = await requireAuth()

  return (
    <AppContent variant="narrow">
      <SettingsForm planTier={session.user.planTier} />
    </AppContent>
  )
}
