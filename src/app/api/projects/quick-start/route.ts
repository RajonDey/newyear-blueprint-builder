import { z } from "zod"
import type { LifeCategory } from "@prisma/client"
import { db } from "@/lib/db"
import { sanitizeRichTextHtml } from "@/lib/sanitize"
import {
  findDefaultAreaIdForCategory,
} from "@/lib/areas/default-areas"
import {
  apiCreated,
  apiInvalidInput,
  apiNotFound,
  apiPlanLimit,
  handleApiRoute,
  isApiError,
  parseJsonBody,
  requireApiSession,
  tierLimits,
} from "@/lib/api-route"

const lifeCategorySchema = z.enum([
  "HEALTH",
  "CAREER",
  "FINANCE",
  "RELATIONSHIPS",
  "SPIRITUALITY",
  "PASSION",
])

const quickStartSchema = z.object({
  category: lifeCategorySchema,
  title: z.string().min(1).max(500),
  description: z.string().max(2000).optional(),
  areaId: z.string().min(1).optional(),
})

export async function POST(req: Request) {
  return handleApiRoute(async () => {
    const session = await requireApiSession()
    if (isApiError(session)) return session

    const body = await parseJsonBody(req)
    const parsed = quickStartSchema.safeParse(body)
    if (!parsed.success) {
      return apiInvalidInput(parsed.error.flatten())
    }

    const userId = session.userId
    const year = new Date().getFullYear()
    const limits = tierLimits(session.planTier)

    let areaId: string | undefined
    let category: LifeCategory = parsed.data.category

    if (parsed.data.areaId) {
      const area = await db.area.findFirst({
        where: { id: parsed.data.areaId, userId },
        select: { id: true, category: true },
      })
      if (!area) {
        return apiNotFound("Area not found")
      }
      areaId = area.id
      if (area.category) {
        category = area.category
      }
    } else {
      const resolved = await findDefaultAreaIdForCategory(userId, category)
      if (resolved) areaId = resolved
    }

    let plan = await db.yearlyPlan.findFirst({
      where: { userId, status: "ACTIVE" },
    })
    if (!plan) {
      plan = await db.yearlyPlan.create({
        data: { userId, year, status: "ACTIVE" },
      })
    }

    const projectCount = await db.project.count({ where: { planId: plan.id } })
    if (projectCount >= limits.maxProjects) {
      return apiPlanLimit(
        "PROJECT_LIMIT",
        `Reached the cap of ${limits.maxProjects} projects for your plan.`,
      )
    }

    const project = await db.project.create({
      data: {
        planId: plan.id,
        areaId: areaId ?? null,
        category,
        type: "PRIMARY",
        title: parsed.data.title,
        description: sanitizeRichTextHtml(parsed.data.description) || null,
        sortOrder: projectCount,
      },
    })

    return apiCreated({ planId: plan.id, projectId: project.id, areaId: project.areaId })
  })
}
