import { describe, expect, it, vi } from "vitest"

vi.mock("@/lib/legal", () => ({
  getSupportEmail: () => "support@example.com",
}))

import { SUPPORT_REPLY_SLA, buildSupportMailto } from "@/lib/support"

describe("support helpers", () => {
  it("builds a plain mailto link", () => {
    expect(buildSupportMailto()).toBe("mailto:support@example.com")
  })

  it("builds a mailto link with subject and body", () => {
    const href = buildSupportMailto({
      subject: "Help",
      body: "Hello",
    })
    expect(href).toContain("mailto:support@example.com?")
    expect(href).toContain("subject=Help")
    expect(href).toContain("body=Hello")
  })

  it("defines a reply SLA string", () => {
    expect(SUPPORT_REPLY_SLA).toMatch(/business days/)
  })
})
