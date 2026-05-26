import { test, expect } from "@playwright/test"

/**
 * Smoke tests runnable in CI without OAuth credentials.
 * Middleware + marketing pages + unauthenticated API gates.
 *
 * Full login → onboarding → weekly → export: run locally with stored auth
 * (see docs/TESTING.md and e2e/authenticated.spec.ts).
 */
test.describe("public marketing", () => {
  test("home page loads", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveTitle(/YearInReview/i)
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  })

  test("login page loads", async ({ page }) => {
    await page.goto("/login")
    await expect(page.getByRole("heading")).toBeVisible()
  })

  test("pricing page loads", async ({ page }) => {
    await page.goto("/pricing")
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  })

  test("FAQ export answer reflects shipped feature", async ({ page }) => {
    await page.goto("/faq")
    await expect(page.getByText(/JSON export/i).first()).toBeVisible()
    await expect(page.getByText(/export.*coming soon/i)).toHaveCount(0)
  })

  test("pricing truth — export shipped, no unlimited project claims", async ({
    page,
  }) => {
    await page.goto("/pricing")
    await expect(page.getByText(/included in settings/i).first()).toBeVisible()
    await expect(page.getByText(/unlimited projects/i)).toHaveCount(0)
    await expect(page.getByText(/json export.*coming soon/i)).toHaveCount(0)
  })
})

test.describe("auth gates", () => {
  test("dashboard redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/dashboard")
    await page.waitForURL(/\/login/)
    expect(page.url()).toContain("/login")
    expect(page.url()).toContain("callbackUrl")
  })

  test("weekly rhythm redirects unauthenticated users to login", async ({
    page,
  }) => {
    await page.goto("/rhythm/weekly")
    await page.waitForURL(/\/login/)
    expect(page.url()).toContain("/login")
    expect(page.url()).toContain("callbackUrl")
  })

  test("settings redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/settings")
    await page.waitForURL(/\/login/)
    expect(page.url()).toContain("/login")
  })

  test("projects redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/projects")
    await page.waitForURL(/\/login/)
    expect(page.url()).toContain("/login")
  })

  test("onboarding redirects unauthenticated users to login", async ({
    page,
  }) => {
    await page.goto("/onboarding")
    await page.waitForURL(/\/login/)
    expect(page.url()).toContain("/login")
  })
})

test.describe("unauthenticated API", () => {
  test("GET /api/export returns 401", async ({ request }) => {
    const res = await request.get("/api/export")
    expect(res.status()).toBe(401)
  })

  test("GET /api/search returns 401", async ({ request }) => {
    const res = await request.get("/api/search?q=test")
    expect(res.status()).toBe(401)
  })

  test("POST /api/onboarding returns 401", async ({ request }) => {
    const res = await request.post("/api/onboarding", {
      data: { year: 2026, theme: "Focus" },
    })
    expect(res.status()).toBe(401)
  })

  test("cron routes reject missing secret", async ({ request }) => {
    const res = await request.get("/api/cron/weekly-reminder")
    expect(res.status()).toBe(401)
  })
})
