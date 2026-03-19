import type { Metadata } from "next"

export const metadata: Metadata = { title: "Create Your Plan" }

export default function NewPlanPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Create Your Year Plan</h1>
        <p className="text-muted-foreground">
          Follow the guided process to build your personalized annual plan.
        </p>
      </div>
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Planning wizard will be built in Phase 1.
      </div>
    </div>
  )
}
