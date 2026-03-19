import type { Metadata } from "next"

export const metadata: Metadata = { title: "Subscriptions - Admin" }

export default function AdminSubscriptionsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Subscriptions</h1>
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Subscription management will be built in Phase 4.
      </div>
    </div>
  )
}
