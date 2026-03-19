import type { Metadata } from "next"

export const metadata: Metadata = { title: "Admin Dashboard" }

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Total Users</p>
          <p className="text-3xl font-bold mt-1">0</p>
        </div>
        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Pro Subscribers</p>
          <p className="text-3xl font-bold mt-1">0</p>
        </div>
        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Active This Week</p>
          <p className="text-3xl font-bold mt-1">0</p>
        </div>
        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">MRR</p>
          <p className="text-3xl font-bold mt-1">$0</p>
        </div>
      </div>
    </div>
  )
}
