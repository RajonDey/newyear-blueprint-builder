import { db } from "@/lib/db"

type CancelResult = { cancelled: boolean; subscriptionId?: string }

type LemonUrls = {
  customer_portal?: string | null
}

type LemonApiResponse = {
  data?: {
    attributes?: {
      urls?: LemonUrls
    }
  }
  errors?: { detail?: string }[]
}

function getLemonApiKey(): string | null {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY?.trim()
  if (apiKey) return apiKey
  if (process.env.NODE_ENV === "production") {
    throw new Error("LEMONSQUEEZY_API_KEY is not configured")
  }
  return null
}

async function fetchLemonPortalUrl(
  resource: "subscriptions" | "customers",
  id: string,
): Promise<string | null> {
  const apiKey = getLemonApiKey()
  if (!apiKey) {
    console.warn(
      `[lemonsqueezy] skipping portal — LEMONSQUEEZY_API_KEY not set (dev)`,
    )
    return null
  }

  const res = await fetch(
    `https://api.lemonsqueezy.com/v1/${resource}/${id}`,
    {
      headers: {
        Accept: "application/vnd.api+json",
        Authorization: `Bearer ${apiKey}`,
      },
      cache: "no-store",
    },
  )

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as LemonApiResponse
    const detail = err.errors?.[0]?.detail ?? "Lemon Squeezy portal lookup failed"
    throw new Error(detail)
  }

  const json = (await res.json()) as LemonApiResponse
  return json.data?.attributes?.urls?.customer_portal ?? null
}

/**
 * Returns a signed Lemon Squeezy customer portal URL (valid ~24h).
 * Prefers subscription lookup, then customer lookup.
 */
export async function getCustomerPortalUrl(
  userId: string,
): Promise<string | null> {
  const subscription = await db.subscription.findUnique({
    where: { userId },
    select: {
      lsSubscriptionId: true,
      lsCustomerId: true,
    },
  })

  if (!subscription) return null

  if (subscription.lsSubscriptionId) {
    const url = await fetchLemonPortalUrl(
      "subscriptions",
      subscription.lsSubscriptionId,
    )
    if (url) return url
  }

  return fetchLemonPortalUrl("customers", subscription.lsCustomerId)
}

/**
 * Cancel an active Lemon Squeezy subscription for a user before account deletion.
 * No-op when the user has no active subscription or Lemon is not configured.
 */
export async function cancelSubscriptionForUser(
  userId: string,
): Promise<CancelResult> {
  const subscription = await db.subscription.findUnique({
    where: { userId },
    select: {
      lsSubscriptionId: true,
      status: true,
    },
  })

  if (!subscription || subscription.status !== "ACTIVE") {
    return { cancelled: false }
  }

  const subscriptionId = subscription.lsSubscriptionId
  if (!subscriptionId) {
    console.warn(
      `[lemonsqueezy] user ${userId} has ACTIVE subscription without lsSubscriptionId`,
    )
    return { cancelled: false }
  }

  const apiKey = process.env.LEMONSQUEEZY_API_KEY?.trim()
  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("LEMONSQUEEZY_API_KEY is not configured")
    }
    console.warn(
      "[lemonsqueezy] skipping cancel — LEMONSQUEEZY_API_KEY not set (dev)",
    )
    return { cancelled: false }
  }

  const res = await fetch(
    `https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`,
    {
      method: "PATCH",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        data: {
          type: "subscriptions",
          id: String(subscriptionId),
          attributes: {
            cancelled: true,
          },
        },
      }),
    },
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const detail =
      (err as { errors?: { detail?: string }[] }).errors?.[0]?.detail ??
      "Lemon Squeezy subscription cancel failed"
    throw new Error(detail)
  }

  await db.subscription.update({
    where: { userId },
    data: {
      status: "CANCELED",
      cancelAtPeriodEnd: true,
    },
  })

  return { cancelled: true, subscriptionId }
}
