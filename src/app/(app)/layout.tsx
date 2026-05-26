import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth-guard"
import { db } from "@/lib/db"
import { AppSidebar } from "@/components/shared/app-sidebar"
import { Topbar } from "@/components/shared/topbar"
import { getUnresolvedDriftCount } from "@/lib/queries/drifts"
import { getIsoWeekContextInTimeZone } from "@/lib/utils"
import { getQuarterLabel } from "@/lib/nav-config"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireAuth()

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      timezone: true,
      _count: { select: { yearlyPlans: true } },
    },
  })

  const driftInboxCount = await getUnresolvedDriftCount(session.user.id)

  // First-time users (no plans ever) get the 90-second onboarding. Anyone
  // with a history of plans goes straight to the dashboard; if the current
  // year has no ACTIVE plan, `/dashboard` itself redirects them back here.
  if (user && user._count.yearlyPlans === 0) {
    redirect("/onboarding")
  }

  const now = new Date()
  const week = getIsoWeekContextInTimeZone(now, user?.timezone || "UTC")
  const weekContext = {
    weekNumber: week.weekNumber,
    quarter: getQuarterLabel(now),
  } as const

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar user={session.user} driftInboxCount={driftInboxCount} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          user={{
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
            planTier: session.user.planTier,
            role: session.user.role,
          }}
          weekContext={weekContext}
          driftInboxCount={driftInboxCount}
        />
        <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
