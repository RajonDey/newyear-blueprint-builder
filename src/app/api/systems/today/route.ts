import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getSystemsForToday } from "@/lib/queries/systems"
import { getWeeklyFocusGoals } from "@/lib/queries/weekly-workspace"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [{ systems, total }, focus] = await Promise.all([
    getSystemsForToday(session.user.id),
    getWeeklyFocusGoals(session.user.id),
  ])

  const data = systems.map((s) => ({
    id: s.id,
    description: s.description,
    frequency: s.frequency,
    isCompleted: s.isCompleted,
    goal: s.goal,
  }))

  return NextResponse.json({
    data: {
      systems: data,
      total,
      weeklyFocus: { goals: focus.goals, protectCategory: focus.protectCategory },
    },
    date: new Date().toISOString().slice(0, 10),
  })
}
