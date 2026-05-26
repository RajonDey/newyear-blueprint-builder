/* Hallmark · design-system: design.md · designed-as-app */

import Link from "next/link"
import {
  CalendarCheck,
  Target,
  BarChart3,
  CalendarRange,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DAILY_HOME_HREF } from "@/lib/app-routes"

interface ActionItem {
  label: string
  href: string
  icon: typeof CalendarCheck
  description: string
}

interface QuickActionsProps {
  primaryAction: ActionItem
}

const secondaryActions: ActionItem[] = [
  {
    label: "Weekly Planner",
    href: "/rhythm/weekly",
    icon: CalendarCheck,
    description: "Plan and review your week",
  },
  {
    label: "Today",
    href: DAILY_HOME_HREF,
    icon: CalendarRange,
    description: "Complete today's systems on the Dashboard",
  },
  {
    label: "Projects",
    href: "/projects",
    icon: Target,
    description: "Update projects and checkpoints",
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    description: "See trends over the year",
  },
]

export function QuickActions({ primaryAction }: QuickActionsProps) {
  return (
    <section className="space-y-4">
      <header>
        <h3 className="font-display text-xl md:text-2xl tracking-tight">
          Next step
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          One small move today
        </p>
      </header>

      <Link
        href={primaryAction.href}
        className="group block border border-amber/30 bg-amber-wash p-4 transition-colors hover:bg-amber-tint"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-tint text-amber">
            <primaryAction.icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-amber">Recommended now</p>
            <p className="mt-1 text-sm font-medium">{primaryAction.label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
              {primaryAction.description}
            </p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-amber" />
        </div>
      </Link>

      <div className="grid gap-2 sm:grid-cols-2">
        {secondaryActions
          .filter((a) => a.href !== primaryAction.href)
          .map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="flex items-center gap-3 border border-border bg-background/50 p-3 transition-colors hover:bg-muted/40"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <a.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{a.label}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {a.description}
                </p>
              </div>
            </Link>
          ))}
      </div>

      <Button variant="ghost" asChild className="w-full justify-center gap-1.5">
        <Link href="/projects">
          Manage projects
          <Sparkles className="h-4 w-4" />
        </Link>
      </Button>
    </section>
  )
}
