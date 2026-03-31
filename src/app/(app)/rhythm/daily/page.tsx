import type { Metadata } from "next"
import { requireAuth } from "@/lib/auth-guard"
import { SystemsTracker } from "@/components/systems/systems-tracker"

export const metadata: Metadata = { title: "Daily Habits" }

export default async function DailyPage() {
  await requireAuth()

  return <SystemsTracker />
}
