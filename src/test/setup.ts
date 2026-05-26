import { vi } from "vitest"

const { authMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
}))

export { authMock }

vi.mock("@/lib/auth", () => ({
  auth: authMock,
}))

/** Tests mock `auth()` only — bypass DB user lookup in API guards. */
vi.mock("@/lib/auth-guard", () => ({
  resolveSessionUser: vi.fn(async (session: Awaited<ReturnType<typeof authMock>>) => {
    if (!session?.user?.id) return null
    return session
  }),
  requireSessionUser: vi.fn(async () => {
    const session = await authMock()
    if (!session?.user?.id) return null
    return session
  }),
  requireAuth: vi.fn(async () => {
    const session = await authMock()
    if (!session?.user?.id) {
      throw new Error("redirect:/login?error=SessionInvalid")
    }
    return session
  }),
  requireAdmin: vi.fn(async () => {
    const session = await authMock()
    if (!session?.user?.id) {
      throw new Error("redirect:/login?error=SessionInvalid")
    }
    if (session.user.role !== "ADMIN") {
      throw new Error("redirect:/dashboard")
    }
    return session
  }),
}))

export function mockSession(
  overrides: Partial<{
    id: string
    email: string
    planTier: "FREE" | "PRO"
    role: "USER" | "ADMIN"
  }> = {},
) {
  return {
    user: {
      id: "user-test-1",
      email: "test@example.com",
      planTier: "FREE" as const,
      role: "USER" as const,
      ...overrides,
    },
  }
}
