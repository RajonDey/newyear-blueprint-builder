import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { ACHIEVEMENTS } from "@/lib/constants/achievements"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const earned = await db.achievement.findMany({
    where: { userId: session.user.id },
    orderBy: { earnedAt: "desc" },
  })

  const data = earned.map((a) => ({
    ...a,
    meta: ACHIEVEMENTS[a.type as keyof typeof ACHIEVEMENTS] ?? {
      title: a.title,
      description: "",
      icon: "🏅",
    },
  }))

  return NextResponse.json({ data })
}
