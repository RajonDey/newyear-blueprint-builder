import { readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

/** Patterns that indicate a route is guarded (session, cron secret, or webhook HMAC). */
const AUTH_GUARD_PATTERNS = [
  /requireApiSession/,
  /requireSessionUser/,
  /await auth\(\)/,
  /CRON_SECRET/,
  /verifyCronSecret/,
  /verifyWebhookSignature/,
  /LEMONSQUEEZY_WEBHOOK_SECRET/,
  /rateLimitAuthIfConfigured/,
]

function collectRouteFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      collectRouteFiles(full, acc)
    } else if (entry === "route.ts") {
      acc.push(full)
    }
  }
  return acc
}

describe("API route auth audit", () => {
  it("every api/route.ts includes session auth or an approved secret guard", () => {
    const apiRoot = join(process.cwd(), "src/app/api")
    const routes = collectRouteFiles(apiRoot)
    expect(routes.length).toBeGreaterThan(50)

    const unguarded = routes.filter((file) => {
      const source = readFileSync(file, "utf8")
      return !AUTH_GUARD_PATTERNS.some((pattern) => pattern.test(source))
    })

    expect(unguarded, `Unguarded routes:\n${unguarded.join("\n")}`).toEqual([])
  })
})
