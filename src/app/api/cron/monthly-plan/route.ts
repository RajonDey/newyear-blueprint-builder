import { NextResponse } from "next/server"
import { verifyCronSecret } from "@/lib/cron/cron-auth"
import { runMonthlyRhythmCron } from "@/lib/cron/monthly-rhythm"
import { sendMonthlyPlan } from "@/lib/email"

/** Legacy manual trigger — production uses `/api/cron/rhythm-hourly`. */
export async function GET(req: Request) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await runMonthlyRhythmCron({
    kind: "plan",
    requireTimezoneWindow: false,
    send: (email, monthLabel, name) =>
      sendMonthlyPlan(email, monthLabel, name),
  })

  return NextResponse.json({ data })
}
