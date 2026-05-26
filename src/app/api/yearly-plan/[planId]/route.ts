import { z } from "zod"
import type { Prisma } from "@prisma/client"
import { db } from "@/lib/db"
import {
  apiInvalidInput,
  apiNotFound,
  apiOk,
  handleApiRoute,
  isApiError,
  parseJsonBody,
  requireApiSession,
} from "@/lib/api-route"
import { mergePlanReflections } from "@/lib/yearly-plan/reflections"

const patchSchema = z.object({
  theme: z.string().trim().min(1).max(50).optional(),
  reflections: z.record(z.string(), z.unknown()).optional(),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ planId: string }> },
) {
  return handleApiRoute(async () => {
    const session = await requireApiSession()
    if (isApiError(session)) return session

    const { planId } = await params
    const body = await parseJsonBody(req)
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      return apiInvalidInput(parsed.error.flatten())
    }

    const plan = await db.yearlyPlan.findFirst({
      where: { id: planId, userId: session.userId },
      select: { id: true, reflections: true, status: true },
    })
    if (!plan) {
      return apiNotFound("Plan not found")
    }

    const reflections = mergePlanReflections(plan.reflections, {
      ...(parsed.data.theme !== undefined ? { theme: parsed.data.theme } : {}),
    })

    const merged = parsed.data.reflections
      ? { ...reflections, ...parsed.data.reflections }
      : reflections

    const updated = await db.yearlyPlan.update({
      where: { id: planId },
      data: {
        reflections: merged as Prisma.InputJsonValue,
      },
      select: {
        id: true,
        year: true,
        status: true,
        reflections: true,
        archivedAt: true,
      },
    })

    return apiOk(updated)
  })
}
