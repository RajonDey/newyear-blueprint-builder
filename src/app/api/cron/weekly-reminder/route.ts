import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const activePlans = await db.yearlyPlan.findMany({
    where: { status: "ACTIVE" },
    include: {
      user: { select: { email: true, name: true } },
    },
  })

  // TODO: Send weekly reminder emails via Resend
  // For each user with an active plan, send a reminder to do their weekly check-in

  return NextResponse.json({
    data: { usersNotified: activePlans.length },
  })
}
