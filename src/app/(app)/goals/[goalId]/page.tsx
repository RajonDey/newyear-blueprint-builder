export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ goalId: string }>
}) {
  const { goalId } = await params

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Goal Detail</h1>
      <p className="text-muted-foreground">Goal ID: {goalId}</p>
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Goal detail view will be built in Phase 1.
      </div>
    </div>
  )
}
