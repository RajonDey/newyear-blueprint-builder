import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendQuarterlyNudge } from "@/lib/email"

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"] as const

function getCurrentQuarter(): (typeof QUARTERS)[number] {
  const month = new Date().getMonth()
  if (month < 3) return "Q1"
  if (month < 6) return "Q2"
  if (month < 9) return "Q3"
  return "Q4"
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const quarter = getCurrentQuarter()
  const proUsers = await db.user.findMany({
    where: { planTier: "PRO" },
    select: { email: true, name: true },
  })

  const sent: string[] = []
  const errors: { email: string; error: string }[] = []

  for (const user of proUsers) {
    try {
      await sendQuarterlyNudge(user.email, quarter, user.name ?? undefined)
      sent.push(user.email)
    } catch (e) {
      errors.push({
        email: user.email,
        error: e instanceof Error ? e.message : "Unknown error",
      })
    }
  }

  return NextResponse.json({
    data: {
      quarter,
      usersNotified: sent.length,
      sent,
      errors: errors.length > 0 ? errors : undefined,
    },
  })
}
