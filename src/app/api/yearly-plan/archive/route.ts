import { z } from "zod"
import { db } from "@/lib/db"
import {
  apiConflict,
  apiInvalidInput,
  apiNotFound,
  apiOk,
  handleApiRoute,
  isApiError,
  parseJsonBody,
  requireApiSession,
} from "@/lib/api-route"
import { getPlanTheme } from "@/lib/yearly-plan/reflections"

const archiveSchema = z.object({
  planId: z.string().min(1).optional(),
})

export async function POST(req: Request) {
  return handleApiRoute(async () => {
    const session = await requireApiSession()
    if (isApiError(session)) return session

    const body = await parseJsonBody(req)
    const parsed = archiveSchema.safeParse(body ?? {})
    if (!parsed.success) {
      return apiInvalidInput(parsed.error.flatten())
    }

    const plan = parsed.data.planId
      ? await db.yearlyPlan.findFirst({
          where: {
            id: parsed.data.planId,
            userId: session.userId,
            status: "ACTIVE",
          },
          select: { id: true, year: true },
        })
      : await db.yearlyPlan.findFirst({
          where: { userId: session.userId, status: "ACTIVE" },
          select: { id: true, year: true },
        })

    if (!plan) {
      return apiNotFound("No active year plan to archive")
    }

    const activeProjectCount = await db.project.count({
      where: {
        planId: plan.id,
        status: { notIn: ["COMPLETED", "ABANDONED"] },
      },
    })

    const archived = await db.yearlyPlan.update({
      where: { id: plan.id },
      data: {
        status: "ARCHIVED",
        archivedAt: new Date(),
      },
      select: {
        id: true,
        year: true,
        status: true,
        archivedAt: true,
        reflections: true,
      },
    })

    return apiOk({
      plan: archived,
      theme: getPlanTheme(archived.reflections),
      activeProjectCount,
      wrappedUrl: `/wrapped?year=${archived.year}`,
    })
  })
}
