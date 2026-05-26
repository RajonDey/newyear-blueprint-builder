import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Compass } from "lucide-react"
import { requireAuth } from "@/lib/auth-guard"
import { getWheelForUser } from "@/lib/queries/wheel"
import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { WheelEditor } from "@/components/wheel/wheel-editor"

export const metadata: Metadata = { title: "Wheel of Life" }

export default async function WheelPage() {
  const session = await requireAuth()
  const wheel = await getWheelForUser(session.user.id)

  if (!wheel) {
    return (
      <PageContainer>
        <PageHeader
          title="The honest snapshot"
          description="Six categories, rated 1–10 — the same life domains as your Areas in Plan. The point isn't a perfect circle; it's noticing which line moved."
        />
        <EmptyState
          icon={Compass}
          bordered
          title="Start with a yearly plan"
          description="The wheel attaches to your active year. Start onboarding to set yours up — takes about a minute."
          action={
            <Button asChild>
              <Link href="/onboarding">
                Start onboarding <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          }
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title="The honest snapshot"
        description="Six categories, rated 1–10 — the same life domains as your Areas in Plan. The point isn't a perfect circle; it's noticing which line moved."
      />
      <WheelEditor
        planId={wheel.planId}
        planYear={wheel.planYear}
        latest={wheel.latest}
        previous={wheel.previous}
        history={wheel.history}
      />
    </PageContainer>
  )
}
