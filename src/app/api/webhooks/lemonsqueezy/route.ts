import { NextResponse } from "next/server"
import crypto from "crypto"
import { db } from "@/lib/db"

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  const digest = crypto.createHmac("sha256", secret).update(payload).digest("hex")
  const sigBuf = Buffer.from(signature, "utf8")
  const digBuf = Buffer.from(digest, "utf8")
  if (sigBuf.length !== digBuf.length) {
    return false
  }
  return crypto.timingSafeEqual(sigBuf, digBuf)
}

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("x-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
  }

  if (!verifyWebhookSignature(body, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  let event: { meta?: { event_name?: string; custom_data?: { user_id?: string } }; data?: { id?: unknown; attributes?: Record<string, unknown> } }
  try {
    event = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
  }

  const eventName = event.meta?.event_name

  switch (eventName) {
    case "subscription_created": {
      const data = event.data
      const attrs = data?.attributes
      const userId = event.meta?.custom_data?.user_id

      if (!userId || !data || !attrs) break

      await db.subscription.upsert({
        where: { lsCustomerId: String(attrs.customer_id) },
        create: {
          userId,
          lsCustomerId: String(attrs.customer_id),
          lsSubscriptionId: String(data.id),
          lsVariantId: String(attrs.variant_id),
          status: "ACTIVE",
          currentPeriodStart: new Date(attrs.created_at as string),
          currentPeriodEnd: attrs.renews_at
            ? new Date(attrs.renews_at as string)
            : null,
        },
        update: {
          lsSubscriptionId: String(data.id),
          lsVariantId: String(attrs.variant_id),
          status: "ACTIVE",
          currentPeriodEnd: attrs.renews_at
            ? new Date(attrs.renews_at as string)
            : null,
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
      const attrs = data?.attributes
      if (!attrs) break
      const customerId = String(attrs.customer_id)

      const statusMap: Record<string, "ACTIVE" | "PAST_DUE" | "CANCELED" | "INACTIVE"> = {
        active: "ACTIVE",
        past_due: "PAST_DUE",
        cancelled: "CANCELED",
        expired: "CANCELED",
        paused: "INACTIVE",
      }

      await db.subscription.updateMany({
        where: { lsCustomerId: customerId },
        data: {
          status: statusMap[String(attrs.status)] || "INACTIVE",
          cancelAtPeriodEnd: Boolean(attrs.cancelled),
          currentPeriodEnd: attrs.renews_at
            ? new Date(attrs.renews_at as string)
            : undefined,
        },
      })
      break
    }

    case "subscription_expired": {
      const data = event.data
      const attrs = data?.attributes
      if (!attrs) break
      const customerId = String(attrs.customer_id)

      await db.subscription.updateMany({
        where: { lsCustomerId: customerId },
        data: { status: "CANCELED" },
      })

      const sub = await db.subscription.findFirst({
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

    case "subscription_cancelled": {
      const data = event.data
      const attrs = data?.attributes
      if (!attrs) break
      const customerId = String(attrs.customer_id)

      await db.subscription.updateMany({
        where: { lsCustomerId: customerId },
        data: { status: "CANCELED", cancelAtPeriodEnd: true },
      })
      break
    }
  }

  return NextResponse.json({ received: true })
}
