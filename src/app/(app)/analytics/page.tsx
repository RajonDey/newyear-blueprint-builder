import type { Metadata } from "next"

export const metadata: Metadata = { title: "Analytics" }

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Analytics</h1>
      <p className="text-muted-foreground">
        Track your progress with detailed insights.
      </p>
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Analytics dashboard will be built in Phase 3 (Premium).
      </div>
    </div>
  )
}
