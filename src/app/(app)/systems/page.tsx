import type { Metadata } from "next"
import { requireAuth } from "@/lib/auth-guard"
import { SystemsTracker } from "@/components/systems/systems-tracker"

export const metadata: Metadata = { title: "Daily Systems" }

export default async function SystemsPage() {
  await requireAuth()

  return <SystemsTracker />
}
