import type { Metadata } from "next"

export const metadata: Metadata = { title: "Quarterly Review" }

export default function QuarterlyReviewPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Quarterly Review</h1>
      <p className="text-muted-foreground">
        Deep-dive into your quarter and recalibrate for the next one.
      </p>
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Quarterly review wizard will be built in Phase 3 (Premium).
      </div>
    </div>
  )
}
