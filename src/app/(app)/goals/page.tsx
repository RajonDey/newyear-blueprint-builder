import type { Metadata } from "next"

export const metadata: Metadata = { title: "Goals" }

export default function GoalsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Goals</h1>
      </div>
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Goals overview will be built in Phase 1.
      </div>
    </div>
  )
}
