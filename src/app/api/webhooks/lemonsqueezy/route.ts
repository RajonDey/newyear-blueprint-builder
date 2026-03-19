import { NextResponse } from "next/server"
import crypto from "crypto"
import { db } from "@/lib/db"

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret)
  const digest = hmac.update(payload).digest("hex")
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
}

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("x-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  const isValid = verifyWebhookSignature(
    body,
    signature,
    process.env.LEMONSQUEEZY_WEBHOOK_SECRET!
  )

  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const event = JSON.parse(body)
  const eventName = event.meta?.event_name

  switch (eventName) {
    case "subscription_created": {
      const data = event.data
      const attrs = data.attributes
      const userId = event.meta?.custom_data?.user_id

      if (!userId) break

      await db.subscription.upsert({
        where: { lsCustomerId: String(attrs.customer_id) },
        create: {
          userId,
          lsCustomerId: String(attrs.customer_id),
          lsSubscriptionId: String(data.id),
          lsVariantId: String(attrs.variant_id),
          status: "ACTIVE",
          currentPeriodStart: new Date(attrs.created_at),
          currentPeriodEnd: attrs.renews_at ? new Date(attrs.renews_at) : null,
        },
        update: {
          lsSubscriptionId: String(data.id),
          lsVariantId: String(attrs.variant_id),
          status: "ACTIVE",
          currentPeriodEnd: attrs.renews_at ? new Date(attrs.renews_at) : null,
        },
      })

      await db.user.update({
        where: { id: userId },
        data: { planTier: "PRO" },
      })
      break
    }

    case "subscription_updated": {
      const data = event.data
      const attrs = data.attributes
      const customerId = String(attrs.customer_id)

      const statusMap: Record<string, "ACTIVE" | "PAST_DUE" | "CANCELED" | "INACTIVE"> = {
        active: "ACTIVE",
        past_due: "PAST_DUE",
        cancelled: "CANCELED",
        expired: "CANCELED",
        paused: "INACTIVE",
      }

      await db.subscription.update({
        where: { lsCustomerId: customerId },
        data: {
          status: statusMap[attrs.status] || "INACTIVE",
          cancelAtPeriodEnd: attrs.cancelled ?? false,
          currentPeriodEnd: attrs.renews_at ? new Date(attrs.renews_at) : undefined,
        },
      })
      break
    }

    case "subscription_cancelled":
    case "subscription_expired": {
      const data = event.data
      const attrs = data.attributes
      const customerId = String(attrs.customer_id)

      await db.subscription.update({
        where: { lsCustomerId: customerId },
        data: { status: "CANCELED" },
      })

      const sub = await db.subscription.findUnique({
        where: { lsCustomerId: customerId },
      })
      if (sub) {
        await db.user.update({
          where: { id: sub.userId },
          data: { planTier: "FREE" },
        })
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
