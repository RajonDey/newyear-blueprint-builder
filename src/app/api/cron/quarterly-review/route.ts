import { NextResponse } from "next/server"
import { verifyCronSecret } from "@/lib/cron/cron-auth"
import { runQuarterlyRhythmCron } from "@/lib/cron/quarterly-rhythm"
import { sendQuarterlyReview } from "@/lib/email"

/** Legacy manual trigger — production uses `/api/cron/rhythm-hourly`. */
export async function GET(req: Request) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await runQuarterlyRhythmCron({
    kind: "review",
    requireTimezoneWindow: false,
    send: (email, quarter, name) => sendQuarterlyReview(email, quarter, name),
  })

  return NextResponse.json({ data })
}
