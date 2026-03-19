import type { Metadata } from "next"

export const metadata: Metadata = { title: "Weekly Check-in" }

export default function WeeklyCheckInPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Weekly Check-in</h1>
      <p className="text-muted-foreground">
        Take 60 seconds to reflect on your progress this week.
      </p>
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Weekly check-in form will be built in Phase 2.
      </div>
    </div>
  )
}
