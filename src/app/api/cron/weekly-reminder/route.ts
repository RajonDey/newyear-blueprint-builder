import { NextResponse } from "next/server"
import { runWeeklyRhythmCron, verifyCronSecret } from "@/lib/cron/weekly-rhythm"
import { sendWeeklyReview } from "@/lib/email"

/** Legacy manual trigger — production uses `/api/cron/rhythm-hourly`. */
export async function GET(req: Request) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await runWeeklyRhythmCron({
    kind: "review",
    requireTimezoneWindow: false,
    send: (_email, _weekNumber, name) => sendWeeklyReview(_email, name),
  })

  return NextResponse.json({ data })
}
