import { NextResponse } from "next/server"
import { verifyCronSecret } from "@/lib/cron/cron-auth"
import { getEmailHealthMetrics } from "@/lib/cron/email-monitoring"

export async function GET(req: Request) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await getEmailHealthMetrics()

  return NextResponse.json({ data })
}
