import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  Activity,
  Lock,
} from "lucide-react"
import { requireAuth } from "@/lib/auth-guard"
import { hasProProductAccess } from "@/lib/plan-access"
import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"

/* Hallmark · design-system: design.md · designed-as-app */

export const metadata: Metadata = { title: "Rhythm" }

type Cadence = {
  id: string
  label: string
  sub: string
  href: string
  icon: typeof CalendarCheck
  blurb: string
  pro?: boolean
}

const CADENCES: Cadence[] = [
  {
    id: "weekly",
    label: "Weekly",
    sub: "Plan & review",
    href: "/rhythm/weekly",
    icon: CalendarCheck,
    blurb:
      "Five minutes on Friday: rate each project, note blockers, carry one focus into next week.",
  },
  {
    id: "monthly",
    label: "Monthly",
    sub: "Plan & review",
    href: "/rhythm/monthly",
    icon: CalendarDays,
    pro: true,
    blurb:
      "Set a focus theme and project intentions at the start, then review wins and friction at month-end.",
  },
  {
    id: "quarterly",
    label: "Quarterly",
    sub: "Plan & review",
    href: "/rhythm/quarterly",
    icon: Activity,
    pro: true,
    blurb:
      "Set a quarter theme and project intentions at the start, then review the season and reset project health.",
  },
]

export default async function RhythmLandingPage() {
  const session = await requireAuth()
  const isPro = hasProProductAccess(session.user.planTier, session.user.role)

  return (
    <PageContainer width="wide">
      <PageHeader
        title="The cadence that lives the plan"
        description="A yearly plan only matters if it shows up on Tuesdays. Three review cadences zoom out when you're ready — daily systems live on your Dashboard Today card."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CADENCES.map((c) => {
          const locked = c.pro && !isPro
          return (
            <Link
              key={c.id}
              href={c.href}
              className={cn(
                "group relative block border bg-card p-5 transition-colors hover:bg-muted/30",
                locked ? "border-amber/30 bg-amber-wash" : "border-border",
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    locked
                      ? "bg-amber-tint text-amber"
                      : "bg-muted/50 text-foreground",
                  )}
                >
                  <c.icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h2 className="font-display text-lg tracking-tight">
                      {c.label}
                    </h2>
                    {locked && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-tint px-1.5 py-0.5 text-[9px] font-medium text-amber">
                        <Lock className="h-2.5 w-2.5" /> Pro
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.sub}</p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {c.blurb}
              </p>
            </Link>
          )
        })}
      </div>

      <p className="mt-8 border-y border-border py-5 text-sm text-muted-foreground leading-relaxed">
        Nested cadences let you adjust without rewriting. Your Dashboard Today
        card rolls up into the weekly review. The weekly review rolls up into
        the monthly. The monthly into the quarter. The quarter into your{" "}
        <Link
          href="/vision"
          className="text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground transition-colors"
        >
          life vision
        </Link>
        .
      </p>
    </PageContainer>
  )
}
