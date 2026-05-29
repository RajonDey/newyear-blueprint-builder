import { beforeEach, describe, expect, it, vi } from "vitest"

const { findUnique, update } = vi.hoisted(() => ({
  findUnique: vi.fn(),
  update: vi.fn(),
}))

vi.mock("@/lib/db", () => ({
  db: {
    subscription: {
      findUnique,
      update,
    },
  },
}))

import { cancelSubscriptionForUser, getCustomerPortalUrl } from "@/lib/lemonsqueezy"

describe("cancelSubscriptionForUser", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal("fetch", vi.fn())
    delete process.env.LEMONSQUEEZY_API_KEY
  })

  it("no-ops when user has no subscription", async () => {
    findUnique.mockResolvedValue(null)

    const result = await cancelSubscriptionForUser("user-1")

    expect(result).toEqual({ cancelled: false })
    expect(fetch).not.toHaveBeenCalled()
  })

  it("no-ops when subscription is not active", async () => {
    findUnique.mockResolvedValue({
      lsSubscriptionId: "sub-1",
      status: "CANCELED",
    })

    const result = await cancelSubscriptionForUser("user-1")

    expect(result).toEqual({ cancelled: false })
    expect(fetch).not.toHaveBeenCalled()
  })

  it("cancels active subscription via Lemon API", async () => {
    process.env.LEMONSQUEEZY_API_KEY = "test-key"
    findUnique.mockResolvedValue({
      lsSubscriptionId: "123",
      status: "ACTIVE",
    })
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response)
    update.mockResolvedValue({})

    const result = await cancelSubscriptionForUser("user-1")

    expect(result).toEqual({ cancelled: true, subscriptionId: "123" })
    expect(fetch).toHaveBeenCalledWith(
      "https://api.lemonsqueezy.com/v1/subscriptions/123",
      expect.objectContaining({ method: "PATCH" }),
    )
    expect(update).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      data: { status: "CANCELED", cancelAtPeriodEnd: true },
    })
  })

  it("throws when Lemon API fails", async () => {
    process.env.LEMONSQUEEZY_API_KEY = "test-key"
    findUnique.mockResolvedValue({
      lsSubscriptionId: "123",
      status: "ACTIVE",
    })
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: async () => ({ errors: [{ detail: "Not found" }] }),
    } as Response)

    await expect(cancelSubscriptionForUser("user-1")).rejects.toThrow("Not found")
    expect(update).not.toHaveBeenCalled()
  })
})

describe("getCustomerPortalUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal("fetch", vi.fn())
    delete process.env.LEMONSQUEEZY_API_KEY
  })

  it("returns null when user has no subscription", async () => {
    findUnique.mockResolvedValue(null)

    const url = await getCustomerPortalUrl("user-1")

    expect(url).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  it("returns portal URL from subscription lookup", async () => {
    process.env.LEMONSQUEEZY_API_KEY = "test-key"
    findUnique.mockResolvedValue({
      lsSubscriptionId: "sub-1",
      lsCustomerId: "cust-1",
    })
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          attributes: {
            urls: { customer_portal: "https://store.lemonsqueezy.com/billing?sig=abc" },
          },
        },
      }),
    } as Response)

    const url = await getCustomerPortalUrl("user-1")

    expect(url).toBe("https://store.lemonsqueezy.com/billing?sig=abc")
    expect(fetch).toHaveBeenCalledWith(
      "https://api.lemonsqueezy.com/v1/subscriptions/sub-1",
      expect.objectContaining({ cache: "no-store" }),
    )
  })

  it("falls back to customer lookup when subscription portal is null", async () => {
    process.env.LEMONSQUEEZY_API_KEY = "test-key"
    findUnique.mockResolvedValue({
      lsSubscriptionId: "sub-1",
      lsCustomerId: "cust-1",
    })
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { attributes: { urls: { customer_portal: null } } },
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            attributes: {
              urls: { customer_portal: "https://store.lemonsqueezy.com/billing?sig=def" },
            },
          },
        }),
      } as Response)

    const url = await getCustomerPortalUrl("user-1")

    expect(url).toBe("https://store.lemonsqueezy.com/billing?sig=def")
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
