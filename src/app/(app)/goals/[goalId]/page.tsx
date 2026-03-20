import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { requireAuth } from "@/lib/auth-guard"
import { AppContent } from "@/components/shared/app-content"
import { getGoalById } from "@/lib/queries/goals"
import { GoalDetailView } from "@/components/goals/goal-detail-view"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ goalId: string }>
}): Promise<Metadata> {
  const session = await auth()
  if (!session?.user?.id) return { title: "Goal" }
  const { goalId } = await params
  const goal = await getGoalById(goalId, session.user.id)
  if (!goal) return { title: "Goal" }
  return { title: goal.title }
}

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ goalId: string }>
}) {
  const session = await requireAuth()
  const { goalId } = await params
  const goal = await getGoalById(goalId, session.user.id)

  if (!goal) notFound()

  return (
    <AppContent variant="narrow">
      <GoalDetailView goal={goal as any} />
    </AppContent>
  )
}
