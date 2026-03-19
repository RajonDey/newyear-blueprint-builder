import type { Metadata } from "next"
import { requireAuth } from "@/lib/auth-guard"
import { SettingsForm } from "@/components/settings/settings-form"

export const metadata: Metadata = { title: "Settings" }

export default async function SettingsPage() {
  await requireAuth()

  return <SettingsForm />
}
