import { Card, CardContent } from "@/components/ui/card"
import { Target, Flame, CalendarCheck, Compass } from "lucide-react"

interface StatsCardsProps {
  goalStats: { total: number; completed: number; inProgress: number; atRisk: number }
  streak: { current: number; longest: number }
  systemsToday: { completed: number; total: number }
  currentQuarter: string
}

const cards = [
  {
    key: "goals",
    label: "Active Goals",
    icon: Target,
    getValue: (p: StatsCardsProps) => p.goalStats.total,
    getSub: (p: StatsCardsProps) =>
      p.goalStats.completed > 0 ? `${p.goalStats.completed} completed` : "Get started",
  },
  {
    key: "streak",
    label: "Check-in Streak",
    icon: Flame,
    getValue: (p: StatsCardsProps) => `${p.streak.current}w`,
    getSub: (p: StatsCardsProps) => `Longest: ${p.streak.longest}w`,
  },
  {
    key: "systems",
    label: "Systems Today",
    icon: CalendarCheck,
    getValue: (p: StatsCardsProps) =>
      `${p.systemsToday.completed}/${p.systemsToday.total}`,
    getSub: (p: StatsCardsProps) =>
      p.systemsToday.total === 0
        ? "No systems set"
        : p.systemsToday.completed === p.systemsToday.total
          ? "All done!"
          : `${p.systemsToday.total - p.systemsToday.completed} remaining`,
  },
  {
    key: "quarter",
    label: "Current Quarter",
    icon: Compass,
    getValue: (p: StatsCardsProps) => p.currentQuarter,
    getSub: () => new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
  },
]

export function StatsCards(props: StatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.key}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                {card.label}
              </p>
              <card.icon className="h-4 w-4 text-accent" />
            </div>
            <p className="text-3xl font-bold mt-1">{card.getValue(props)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {card.getSub(props)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
