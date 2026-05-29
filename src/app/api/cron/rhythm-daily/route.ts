import { NextResponse } from "next/server"
import { verifyCronSecret } from "@/lib/cron/cron-auth"
import { runDailyRhythmCron } from "@/lib/cron/hourly-rhythm"

export const maxDuration = 60

export async function GET(req: Request) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await runDailyRhythmCron()

  return NextResponse.json({ data })
}
