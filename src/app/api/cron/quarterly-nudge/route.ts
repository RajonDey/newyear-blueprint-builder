import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const proUsers = await db.user.findMany({
    where: { planTier: "PRO" },
    select: { email: true, name: true },
  })

  // TODO: Send quarterly review nudge emails to Pro users via Resend
  // Remind them to do their quarterly review and recalibrate goals

  return NextResponse.json({
    data: { usersNotified: proUsers.length },
  })
}
