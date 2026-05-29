import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getCustomerPortalUrl } from "@/lib/lemonsqueezy"

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (session.user.planTier !== "PRO") {
    return NextResponse.json(
      { error: "No active Pro subscription" },
      { status: 403 },
    )
  }

  try {
    const url = await getCustomerPortalUrl(session.user.id)
    if (!url) {
      return NextResponse.json(
        { error: "Billing portal is not available for this account yet" },
        { status: 404 },
      )
    }

    return NextResponse.json({ data: { url } })
  } catch (err) {
    console.error("[billing/portal]", err)
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to open billing portal",
      },
      { status: 502 },
    )
  }
}
