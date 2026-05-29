import { NextResponse } from "next/server"
import { verifyCronSecret } from "@/lib/cron/cron-auth"
import { GET as getQuarterlyReview } from "../quarterly-review/route"

/** Legacy cron path — delegates to quarterly review rhythm. */
export async function GET(req: Request) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return getQuarterlyReview(req)
}
