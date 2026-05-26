import type { Metadata } from "next"
import Link from "next/link"
import { Sparkles } from "lucide-react"
import { requireAuth } from "@/lib/auth-guard"
import { hasProProductAccess } from "@/lib/plan-access"
import { getAreasForUser } from "@/lib/queries/areas"
import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"
import { AreasGrid } from "@/components/areas/areas-grid"

export const metadata: Metadata = { title: "Areas" }

export default async function AreasPage() {
  const session = await requireAuth()
  const isPro = hasProProductAccess(session.user.planTier, session.user.role)
  const areas = await getAreasForUser(session.user.id)

  return (
    <PageContainer>
      <PageHeader
        title="The shape of your year"
        description="Each area holds the projects you're moving on. Your six default areas use the same names and colors as the Wheel — Health, Career, Finance, and the rest. Custom areas (Pro) borrow a color family from those domains."
      />

      <AreasGrid areas={areas} isPro={isPro} />

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground pt-2">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-amber" />
          Press{" "}
          <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted text-[10px]">
            ⌘K
          </kbd>{" "}
          anywhere to jump or capture.
        </span>
        <Link
          href="/anti-goals"
          className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
        >
          Define what you&apos;re <em>not</em> doing → Anti-goals
        </Link>
      </div>
    </PageContainer>
  )
}
