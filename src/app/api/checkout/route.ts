import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const apiKey = process.env.LEMONSQUEEZY_API_KEY
  const storeId = process.env.LEMONSQUEEZY_STORE_ID
  const yearlyVariantId = process.env.LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID
  const monthlyVariantId = process.env.LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID

  if (!apiKey || !storeId) {
    return NextResponse.json(
      { error: "Checkout not configured" },
      { status: 503 }
    )
  }

  const variantId = yearlyVariantId || monthlyVariantId
  if (!variantId) {
    return NextResponse.json(
      { error: "No variant configured" },
      { status: 503 }
    )
  }

  const body = await req.json().catch(() => ({}))
  if (body.plan === "monthly") {
    return NextResponse.json(
      { error: "Monthly billing is not available yet" },
      { status: 400 },
    )
  }

  const plan = "yearly"
  const variant = yearlyVariantId

  if (!variant) {
    return NextResponse.json(
      { error: `${plan} plan not available` },
      { status: 400 }
    )
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  const res = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          product_options: {
            redirect_url: `${appUrl}/dashboard?upgraded=1`,
            enabled_variants: [parseInt(String(variant), 10)],
          },
          checkout_data: {
            custom: {
              user_id: session.user.id,
            },
            email: session.user.email ?? undefined,
            name: session.user.name ?? undefined,
          },
          test_mode: process.env.NODE_ENV !== "production",
        },
        relationships: {
          store: {
            data: { type: "stores", id: String(storeId) },
          },
          variant: {
            data: { type: "variants", id: String(variant) },
          },
        },
      },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    return NextResponse.json(
      { error: err.errors?.[0]?.detail || "Checkout creation failed" },
      { status: res.status }
    )
  }

  const json = await res.json()
  const checkoutUrl = json.data?.attributes?.url

  if (!checkoutUrl) {
    return NextResponse.json(
      { error: "No checkout URL returned" },
      { status: 500 }
    )
  }

  return NextResponse.json({ data: { url: checkoutUrl } })
}
