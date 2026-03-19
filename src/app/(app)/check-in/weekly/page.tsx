import type { Metadata } from "next"
import { requireAuth } from "@/lib/auth-guard"
import { getCheckInFormData } from "@/lib/queries/check-in"
import { WeeklyCheckInForm } from "@/components/check-in/weekly-check-in-form"

export const metadata: Metadata = { title: "Weekly Check-in" }

export default async function WeeklyCheckInPage() {
  const session = await requireAuth()
  const data = await getCheckInFormData(session.user.id)

  if (!data) {
    return (
      <div className="max-w-2xl space-y-8">
        <h1 className="font-display text-3xl font-semibold">
          Weekly Check-in
        </h1>
        <p className="text-muted-foreground">
          Create your yearly plan first to start tracking weekly progress.
        </p>
        <a
          href="/plan/new"
          className="inline-flex items-center gap-2 text-accent hover:underline font-medium"
        >
          Create your plan →
        </a>
      </div>
    )
  }

  return <WeeklyCheckInForm data={data} />
}
