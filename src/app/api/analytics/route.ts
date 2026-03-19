import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { planLimits } from "@/lib/config"
import { getAnalyticsData } from "@/lib/queries/analytics"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const limits = planLimits[session.user.planTier]
  if (!limits.advancedAnalytics) {
    return NextResponse.json(
      { error: "Analytics is a Pro feature. Upgrade to unlock." },
      { status: 403 }
    )
  }

  const data = await getAnalyticsData(session.user.id)
  if (!data) {
    return NextResponse.json({ data: null })
  }

  return NextResponse.json({ data })
}
