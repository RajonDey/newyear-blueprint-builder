import { NextResponse } from "next/server"
import { verifyCronSecret } from "@/lib/cron/cron-auth"
import { runLifecycleCron } from "@/lib/cron/lifecycle-email"

export async function GET(req: Request) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await runLifecycleCron()

  return NextResponse.json({ data })
}
