import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { hasProProductAccess } from "@/lib/plan-access"
import { getAnalyticsData } from "@/lib/queries/analytics"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!hasProProductAccess(session.user.planTier, session.user.role)) {
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
