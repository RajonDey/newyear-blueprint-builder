import { test, expect } from "@playwright/test"

/**
 * Optional authenticated flow — skipped in CI unless E2E_STORAGE_STATE is set.
 *
 * Local setup:
 * 1. Sign in manually once in headed mode and save storage:
 *    npx playwright codegen --save-storage=e2e/.auth/user.json http://localhost:3000/login
 * 2. E2E_STORAGE_STATE=e2e/.auth/user.json npm run test:e2e -- e2e/authenticated.spec.ts
 */
const storageState = process.env.E2E_STORAGE_STATE
const hasAuth = Boolean(storageState)

test.describe("authenticated critical path", () => {
  test.skip(!hasAuth, "Set E2E_STORAGE_STATE to run authenticated flows")

  test.use({ storageState: storageState! })
  test("dashboard loads after sign-in", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  })

  test("weekly review workspace loads", async ({ page }) => {
    await page.goto("/rhythm/weekly?tab=review")
    await expect(page).toHaveURL(/\/rhythm\/weekly/)
    await expect(page.getByRole("tab", { name: /review/i })).toBeVisible()
  })

  test("settings export section is present", async ({ page }) => {
    await page.goto("/settings#export")
    await expect(page.getByRole("button", { name: /export your data/i })).toBeVisible()
  })

  test("export API returns JSON when authenticated", async ({ page, request }) => {
    await page.goto("/dashboard")
    const cookies = await page.context().cookies()
    const res = await request.get("/api/export", {
      headers: {
        Cookie: cookies.map((c) => `${c.name}=${c.value}`).join("; "),
      },
    })
    expect(res.status()).toBe(200)
    expect(res.headers()["content-type"]).toContain("application/json")
    const body = await res.text()
    expect(body).toContain('"app": "yearinreview"')
  })
})
