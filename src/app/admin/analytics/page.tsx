import type { Metadata } from "next"

export const metadata: Metadata = { title: "Analytics - Admin" }

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Platform Analytics</h1>
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Platform analytics will be built in Phase 4.
      </div>
    </div>
  )
}
