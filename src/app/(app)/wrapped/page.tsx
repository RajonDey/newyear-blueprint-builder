import type { Metadata } from "next"
import { requireAuth } from "@/lib/auth-guard"
import { AppContent } from "@/components/shared/app-content"
import { WrappedSummary } from "@/components/wrapped/wrapped-summary"
import { getWrappedData } from "@/lib/queries/wrapped"
import { isYearWrappedPeakSeason } from "@/lib/wrapped-season"

/* Hallmark · design-system: design.md · Special ceremony page (Wave G). */

export const metadata: Metadata = { title: "Year Wrapped" }

export default async function WrappedPage() {
  const session = await requireAuth()
  const data = await getWrappedData(session.user.id)
  const showOffSeasonBanner = !isYearWrappedPeakSeason()

  return (
    <AppContent variant="wide">
      <WrappedSummary
        initialData={data}
        showOffSeasonBanner={showOffSeasonBanner}
      />
    </AppContent>
  )
}
