import { NextResponse } from "next/server"
import { runWeeklyRhythmCron, verifyCronSecret } from "@/lib/cron/weekly-rhythm"
import { sendWeeklyPlan } from "@/lib/email"

/** Legacy manual trigger — production uses `/api/cron/rhythm-hourly`. */
export async function GET(req: Request) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await runWeeklyRhythmCron({
    kind: "plan",
    requireTimezoneWindow: false,
    send: (email, weekNumber, name) =>
      sendWeeklyPlan(email, weekNumber, name),
  })

  return NextResponse.json({ data })
}
