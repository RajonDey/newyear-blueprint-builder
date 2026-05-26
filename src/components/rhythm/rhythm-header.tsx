"use client"

/* Hallmark · design-system: design.md · designed-as-app */

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CalendarCheck,
  CalendarDays,
  Activity,
  ArrowRight,
} from "lucide-react"
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

export function RhythmHeader({ stats }: { stats?: RhythmStats | null }) {
  const pathname = usePathname()
  const active = tabs.find(
    (t) => pathname === t.href || pathname.startsWith(t.href + "/"),
  )

  if (pathname === "/rhythm") return null

  const recapHref = active ? `/recap/${active.id}` : null

  return (
    <AppContent variant="wide">
      <div className="space-y-3 border-b border-border pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-muted-foreground">Rhythm</p>
          {recapHref && (
            <Link
              href={recapHref}
              className="inline-flex items-center gap-2 border border-border px-3 py-2 text-sm transition-colors hover:bg-muted/40 self-start sm:self-auto"
            >
              <span className="text-muted-foreground">Recap</span>
              <span className="font-medium capitalize">{active!.id}</span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
          )}
        </div>

        {stats && <RhythmStatsStrip stats={stats} />}

        <nav
          className="grid grid-cols-3 gap-px border border-border bg-border"
          aria-label="Rhythm cadence"
        >
          {tabs.map((tab) => {
            const isActive = active?.id === tab.id
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={cn(
                  "relative bg-background px-2 py-2.5 text-left transition-colors sm:px-3",
                  isActive
                    ? "bg-muted/50 text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
                )}
              >
                <span className="flex flex-col gap-0.5">
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
