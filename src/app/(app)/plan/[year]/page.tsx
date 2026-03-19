import type { Metadata } from "next"

export const metadata: Metadata = { title: "My Plan" }

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ year: string }>
}) {
  const { year } = await params

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">{year} Plan</h1>
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Plan details will be built in Phase 1.
      </div>
    </div>
  )
}
