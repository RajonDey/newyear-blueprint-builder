import { NextResponse } from "next/server"
import { verifyCronSecret } from "@/lib/cron/cron-auth"
import { runHourlyRhythmCron } from "@/lib/cron/hourly-rhythm"

export async function GET(req: Request) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await runHourlyRhythmCron()

  return NextResponse.json({ data })
}
