import { NextResponse } from "next/server"
import { runDailyNudgeCron } from "@/lib/cron/daily-nudge-rhythm"
import { verifyCronSecret } from "@/lib/cron/cron-auth"
import { sendDailyNudge } from "@/lib/email"

/** Legacy manual trigger — production uses `/api/cron/rhythm-hourly`. */
export async function GET(req: Request) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await runDailyNudgeCron({
    requireTimezoneWindow: false,
    send: (email, name) => sendDailyNudge(email, name),
  })

  return NextResponse.json({ data })
}
