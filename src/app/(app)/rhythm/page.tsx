import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  Compass,
  Activity,
  Lock,
} from "lucide-react"
import { requireAuth } from "@/lib/auth-guard"
import { hasProProductAccess } from "@/lib/plan-access"
import { PageContainer } from "@/components/shared/page-container"
import { cn } from "@/lib/utils"
import { DAILY_HOME_HREF } from "@/lib/app-routes"

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

/**
 * `/rhythm` landing — Phase 6 replaces the auto-redirect with an editorial
 * landing card. From here the user navigates to whichever cadence is
 * relevant right now; sub-pages keep their existing UX.
 */
export default async function RhythmLandingPage() {
  const session = await requireAuth()
  const isPro = hasProProductAccess(session.user.planTier, session.user.role)

  return (
    <PageContainer width="wide">
      <div className="space-y-8">
      <header className="space-y-3">
        <div className="text-[11px] font-semibold tracking-widest uppercase text-amber inline-flex items-center gap-1.5">
          <Compass className="h-3 w-3" />
          Rhythm
        </div>
        <h1 className="font-display text-4xl md:text-5xl tracking-tight leading-[1.05]">
          The cadence that lives the plan
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          A yearly plan only matters if it shows up on Tuesdays. These three
          review cadences keep you honest without becoming another to-do list
          — each one zooms out a level when you&apos;re ready. Daily systems
          live on your{" "}
          <Link
            href={DAILY_HOME_HREF}
            className="text-foreground hover:underline underline-offset-2"
          >
            Dashboard Today
          </Link>{" "}
          card.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {CADENCES.map((c) => {
          const locked = c.pro && !isPro
          return (
            <Link
              key={c.id}
              href={c.href}
              className={cn(
                "group relative block overflow-hidden rounded-2xl border bg-card p-5 transition-colors hover:bg-card/80",
                locked
                  ? "border-amber/30 bg-gradient-to-br from-amber/[0.04] via-card to-card"
                  : "border-border",
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    locked
                      ? "bg-amber/15 text-amber"
                      : "bg-foreground/5 text-foreground",
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
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-amber/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-amber">
                        <Lock className="h-2.5 w-2.5" /> Pro
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-0.5">
                    {c.sub}
                  </p>
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

      <div className="rounded-2xl border border-dashed border-border/70 bg-card/40 p-5 text-sm text-muted-foreground">
        <p className="leading-relaxed">
          Nested cadences let you adjust without rewriting. Your Dashboard Today
          card rolls up into the weekly review. The weekly review rolls up into
          the monthly. The monthly into the quarter. The quarter into your{" "}
          <Link
            href="/vision"
            className="text-foreground hover:underline underline-offset-2"
          >
            life vision
          </Link>
          .
        </p>
      </div>
      </div>
    </PageContainer>
  )
}
