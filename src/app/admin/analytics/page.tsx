import type { Metadata } from "next"
import { getAdminAnalytics } from "@/lib/queries/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = { title: "Analytics - Admin" }

export default async function AdminAnalyticsPage() {
  const analytics = await getAdminAnalytics()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Platform Analytics</h1>
        <p className="text-muted-foreground mt-1">
          User growth, plans, and check-in activity.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">New Users by Month</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.usersByMonth.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {analytics.usersByMonth.map(({ month, count }) => (
                  <li key={month} className="flex justify-between">
                    <span>{month}</span>
                    <span className="font-medium">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Plans by Year</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.plansByYear.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {analytics.plansByYear.map(({ year, _count }) => (
                  <li key={year} className="flex justify-between">
                    <span>{year}</span>
                    <span className="font-medium">{_count.id}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Weekly Check-ins (This Year)</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.checkInsByWeek.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            ) : (
              <ul className="grid gap-2 text-sm sm:grid-cols-2 md:grid-cols-4">
                {analytics.checkInsByWeek.map(({ year, weekNumber, _count }) => (
                  <li key={`${year}-${weekNumber}`} className="flex justify-between rounded border px-3 py-2">
                    <span>W{weekNumber} {year}</span>
                    <span className="font-medium">{_count.id}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
