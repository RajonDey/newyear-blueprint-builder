"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  CalendarCheck,
  CalendarDays,
  Activity,
  ArrowRight,
} from "lucide-react"
import { Eyebrow } from "@/components/atmosphere/eyebrow"
import { AppContent } from "@/components/shared/app-content"
import { RhythmStatsStrip } from "@/components/rhythm/rhythm-stats-strip"
import type { RhythmStats } from "@/lib/queries/rhythm-stats"
import { cn } from "@/lib/utils"

const tabs = [
  {
    id: "weekly",
    name: "Weekly",
    href: "/rhythm/weekly",
    icon: CalendarCheck,
    sub: "Plan & check-in",
  },
  {
    id: "monthly",
    name: "Monthly",
    href: "/rhythm/monthly",
    icon: CalendarDays,
    sub: "Recalibrate",
  },
  {
    id: "quarterly",
    name: "Quarterly",
    href: "/rhythm/quarterly",
    icon: Activity,
    sub: "Reset the season",
  },
]

/**
 * Compact rhythm chrome — cadence nav + optional recap link.
 * Page titles live on each sub-route via `<PageHeader />`.
 */
export function RhythmHeader({ stats }: { stats?: RhythmStats | null }) {
  const pathname = usePathname()
  const active = tabs.find(
    (t) => pathname === t.href || pathname.startsWith(t.href + "/"),
  )

  if (pathname === "/rhythm") return null

  const recapHref = active ? `/recap/${active.id}` : null

  return (
    <AppContent variant="wide">
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Eyebrow className="mb-0">Rhythm</Eyebrow>
          {recapHref && (
            <Link
              href={recapHref}
              className="group inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm hover:bg-accent/5 transition-colors self-start sm:self-auto"
            >
              <span className="text-muted-foreground">Recap</span>
              <span className="font-medium capitalize">{active!.id}</span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>

        {stats && <RhythmStatsStrip stats={stats} />}

        <nav
          className="grid grid-cols-3 gap-1.5 rounded-2xl border border-border bg-card p-1.5"
          aria-label="Rhythm cadence"
        >
          {tabs.map((tab) => {
            const isActive = active?.id === tab.id
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={cn(
                  "relative rounded-xl px-2 py-2 text-left transition-colors sm:px-3 sm:py-2.5",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="rhythm-pill"
                    className="absolute inset-0 rounded-xl bg-secondary"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative flex flex-col gap-0.5">
                  <span className="flex items-center gap-1.5 text-xs sm:text-sm font-medium">
                    <tab.icon className="h-3.5 w-3.5 shrink-0" />
                    {tab.name}
                  </span>
                  <span className="text-[10px] sm:text-[11px] opacity-70 hidden sm:block">
                    {tab.sub}
                  </span>
                </span>
              </Link>
            )
          })}
        </nav>
      </div>
    </AppContent>
  )
}
