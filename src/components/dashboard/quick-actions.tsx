import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  CalendarCheck,
  Target,
  BarChart3,
  CalendarRange,
  ArrowRight,
  Sparkles,
} from "lucide-react"

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
    description: "Plan your week and review it",
  },
  {
    label: "Daily Habits",
    href: "/rhythm/daily",
    icon: CalendarRange,
    description: "Track today's repeatable actions",
  },
  {
    label: "Goals",
    href: "/goals",
    icon: Target,
    description: "Update goals and checkpoints",
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-display">Next Step</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Link
          href={primaryAction.href}
          className="block rounded-lg border border-accent/30 bg-accent/5 p-4 transition-colors hover:bg-accent/10"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 shrink-0">
              <primaryAction.icon className="h-4 w-4 text-accent" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-wider text-accent font-semibold">
                Recommended now
              </p>
              <p className="text-sm font-semibold mt-0.5">{primaryAction.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {primaryAction.description}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-accent shrink-0 mt-1" />
          </div>
        </Link>

        <div className="grid gap-2 sm:grid-cols-2">
          {secondaryActions
            .filter((action) => action.href !== primaryAction.href)
            .map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 shrink-0">
                <action.icon className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </Link>
            ))}
        </div>
        <Button variant="ghost" asChild className="w-full justify-center gap-1">
          <Link href="/plan/new">
            Refine your yearly plan <Sparkles className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
