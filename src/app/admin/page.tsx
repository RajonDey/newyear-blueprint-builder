import type { Metadata } from "next"
import { getAdminDashboardStats } from "@/lib/queries/admin"
import { Card, CardContent } from "@/components/ui/card"
import { Users, CreditCard, Activity, UserPlus, ClipboardCheck } from "lucide-react"

export const metadata: Metadata = { title: "Admin Dashboard" }

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats()

  const cards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
    },
    {
      label: "Pro Subscribers",
      value: stats.proCount,
      icon: CreditCard,
    },
    {
      label: "Active Subscriptions",
      value: stats.activeSubscriptions,
      icon: CreditCard,
    },
    {
      label: "Check-ins This Week",
      value: stats.checkInsThisWeek,
      icon: ClipboardCheck,
    },
    {
      label: "New Users This Week",
      value: stats.newUsersThisWeek,
      icon: UserPlus,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Platform overview and key metrics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </p>
                <card.icon className="h-4 w-4 text-accent" />
              </div>
              <p className="text-3xl font-bold mt-1">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
