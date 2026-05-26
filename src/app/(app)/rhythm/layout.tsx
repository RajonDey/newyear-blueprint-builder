import { RhythmHeader } from "@/components/rhythm/rhythm-header"
import { requireAuth } from "@/lib/auth-guard"
import { getRhythmStats } from "@/lib/queries/rhythm-stats"

/**
 * Rhythm section layout — shared cadence nav only.
 * Each sub-route owns its own `<PageContainer width="wide">` and `<PageHeader />`.
 */
export default async function RhythmLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAuth()
  const stats = await getRhythmStats(session.user.id)

  return (
    <div className="space-y-6">
      <RhythmHeader stats={stats} />
      {children}
    </div>
  )
}
