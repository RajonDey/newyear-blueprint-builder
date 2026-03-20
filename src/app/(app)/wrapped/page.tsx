import type { Metadata } from "next"
import { requireAuth } from "@/lib/auth-guard"
import { AppContent } from "@/components/shared/app-content"
import { WrappedSummary } from "@/components/wrapped/wrapped-summary"

export const metadata: Metadata = { title: "Year Wrapped" }

export default async function WrappedPage() {
  await requireAuth()

  return (
    <AppContent variant="wide">
      <WrappedSummary />
    </AppContent>
  )
}
