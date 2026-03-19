import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { requireAuth } from "@/lib/auth-guard"
import { getGoalById } from "@/lib/queries/goals"
import { GoalDetailView } from "@/components/goals/goal-detail-view"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ goalId: string }>
}): Promise<Metadata> {
  const { goalId } = await params
  return { title: `Goal — ${goalId.slice(0, 6)}` }
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

  return <GoalDetailView goal={goal as any} />
}
