import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CalendarCheck,
  Target,
  BarChart3,
  CalendarRange,
} from "lucide-react"

const actions = [
  {
    label: "Weekly rhythm",
    href: "/check-in/weekly",
    icon: CalendarCheck,
    description: "Plan the week and reflect",
  },
  {
    label: "View Goals",
    href: "/goals",
    icon: Target,
    description: "Review and update your goals",
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    description: "See trends and patterns",
  },
  {
    label: "Daily Systems",
    href: "/systems",
    icon: CalendarRange,
    description: "Track today's habits",
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-display">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-2">
          {actions.map((action) => (
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
      </CardContent>
    </Card>
  )
}
