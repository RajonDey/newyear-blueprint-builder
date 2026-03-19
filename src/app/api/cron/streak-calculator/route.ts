import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // TODO: Calculate and update streaks
  // For each user, check if they did a weekly check-in this week
  // If yes, increment streak. If no, check if they have a shield (premium).
  // Update longest streak if current > longest.

  const streaks = await db.streak.findMany({
    where: { type: "WEEKLY_CHECK_IN" },
  })

  return NextResponse.json({
    data: { streaksProcessed: streaks.length },
  })
}
