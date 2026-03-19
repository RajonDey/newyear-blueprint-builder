import type { Metadata } from "next"
import { requireAuth } from "@/lib/auth-guard"

export const metadata: Metadata = { title: "Dashboard" }

export default async function DashboardPage() {
  const session = await requireAuth()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {session.user.name?.split(" ")[0] || "there"}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s your year at a glance.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Active Goals</p>
          <p className="text-3xl font-bold mt-1">0</p>
        </div>
        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Check-in Streak</p>
          <p className="text-3xl font-bold mt-1">0 weeks</p>
        </div>
        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Systems Today</p>
          <p className="text-3xl font-bold mt-1">0/0</p>
        </div>
        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Quarter</p>
          <p className="text-3xl font-bold mt-1">Q1</p>
        </div>
      </div>
    </div>
  )
}
