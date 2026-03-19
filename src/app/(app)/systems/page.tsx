import type { Metadata } from "next"

export const metadata: Metadata = { title: "Daily Systems" }

export default function SystemsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Daily Systems</h1>
      <p className="text-muted-foreground">
        Your daily actions that compound into yearly results.
      </p>
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Daily systems tracker will be built in Phase 2.
      </div>
    </div>
  )
}
