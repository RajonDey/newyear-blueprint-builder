import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import type { ZodError } from "zod"
import { requireSessionUser } from "@/lib/auth-guard"
import { planLimits } from "@/lib/config"

export type PlanTier = keyof typeof planLimits

export type ApiSession = {
  userId: string
  planTier: PlanTier
  role: string
}

export type PaginationMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type ApiErrorBody = {
  error: string
  message?: string
  upgradeUrl?: string
  details?: ReturnType<ZodError["flatten"]>
}

/** True when `requireApiSession()` returned an error response. */
export function isApiError(
  value: ApiSession | NextResponse,
): value is NextResponse {
  return value instanceof NextResponse
}

export async function requireApiSession(): Promise<ApiSession | NextResponse> {
  const session = await requireSessionUser()
  if (!session?.user?.id) {
    return apiUnauthorized(
      "Your session expired or is from a different environment. Sign in again.",
    )
  }
  return {
    userId: session.user.id,
    planTier: (session.user.planTier ?? "FREE") as PlanTier,
    role: session.user.role ?? "USER",
  }
}

export function apiUnauthorized(message = "Unauthorized"): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 })
}

export function apiNotFound(message = "Not found"): NextResponse {
  return NextResponse.json({ error: message }, { status: 404 })
}

export function apiInvalidInput(
  details?: ReturnType<ZodError["flatten"]>,
): NextResponse {
  return NextResponse.json(
    { error: "Invalid input", ...(details ? { details } : {}) },
    { status: 400 },
  )
}

export function apiConflict(message = "Already exists"): NextResponse {
  return NextResponse.json({ error: "Already exists", message }, { status: 409 })
}

export function apiPlanLimit(
  code: string,
  message: string,
  upgradeUrl = "/pricing",
): NextResponse {
  return NextResponse.json(
    { error: code, message, upgradeUrl },
    { status: 402 },
  )
}

export function apiOk<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data }, { status })
}

export function apiCreated<T>(data: T): NextResponse {
  return NextResponse.json({ data }, { status: 201 })
}

export function apiList<T>(
  data: T[],
  pagination: PaginationMeta,
): NextResponse {
  return NextResponse.json({ data, pagination })
}

export async function parseJsonBody(req: Request): Promise<unknown> {
  return req.json().catch(() => null)
}

export function parsePagination(
  searchParams: URLSearchParams,
  defaults: { page?: number; limit?: number; maxLimit?: number } = {},
): { page: number; limit: number; skip: number } {
  const pageRaw = parseInt(searchParams.get("page") ?? String(defaults.page ?? 1), 10)
  const limitRaw = parseInt(
    searchParams.get("limit") ?? String(defaults.limit ?? 20),
    10,
  )
  const maxLimit = defaults.maxLimit ?? 100
  const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(limitRaw, 1), maxLimit)
    : defaults.limit ?? 20
  return { page, limit, skip: (page - 1) * limit }
}

export function paginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  }
}

export function isPrismaUniqueViolation(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002"
  )
}

/**
 * Wraps a route handler to map Prisma unique violations → 409 and log unexpected errors.
 */
export async function handleApiRoute(
  handler: () => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    return await handler()
  } catch (err) {
    if (isPrismaUniqueViolation(err)) {
      return apiConflict()
    }
    console.error("[api]", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export function tierLimits(tier: PlanTier): (typeof planLimits)[PlanTier] {
  return planLimits[tier]
}
