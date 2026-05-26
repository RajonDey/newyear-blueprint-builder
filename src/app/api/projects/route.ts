import { z } from "zod"
import { db } from "@/lib/db"
import { sanitizeRichTextHtml } from "@/lib/sanitize"
import { findDefaultAreaIdForCategory } from "@/lib/areas/default-areas"
import {
  apiCreated,
  apiInvalidInput,
  apiList,
  apiNotFound,
  apiPlanLimit,
  handleApiRoute,
  isApiError,
  paginationMeta,
  parseJsonBody,
  parsePagination,
  requireApiSession,
  tierLimits,
} from "@/lib/api-route"

const createProjectSchema = z.object({
  planId: z.string().min(1),
  category: z.enum([
    "HEALTH",
    "CAREER",
    "FINANCE",
    "RELATIONSHIPS",
    "SPIRITUALITY",
    "PASSION",
  ]),
  type: z.enum(["PRIMARY", "SECONDARY"]),
  title: z.string().min(1).max(500),
  description: z.string().max(2000).optional(),
})

const listSelect = {
  id: true,
  planId: true,
  areaId: true,
  title: true,
  description: true,
  category: true,
  type: true,
  status: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: { tasks: true, systems: true, checkpoints: true, keyResults: true },
  },
} as const

export async function GET(req: Request) {
  return handleApiRoute(async () => {
    const session = await requireApiSession()
    if (isApiError(session)) return session

    const { searchParams } = new URL(req.url)
    const planId = searchParams.get("planId")
    const { page, limit, skip } = parsePagination(searchParams)

    const where = {
      plan: { userId: session.userId },
      ...(planId ? { planId } : {}),
    }

    const [projects, total] = await Promise.all([
      db.project.findMany({
        where,
        select: listSelect,
        orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
        skip,
        take: limit,
      }),
      db.project.count({ where }),
    ])

    return apiList(projects, paginationMeta(total, page, limit))
  })
}

export async function POST(req: Request) {
  return handleApiRoute(async () => {
    const session = await requireApiSession()
    if (isApiError(session)) return session

    const body = await parseJsonBody(req)
    const parsed = createProjectSchema.safeParse(body)
    if (!parsed.success) {
      return apiInvalidInput(parsed.error.flatten())
    }

    const plan = await db.yearlyPlan.findFirst({
      where: { id: parsed.data.planId, userId: session.userId },
    })
    if (!plan) {
      return apiNotFound("Plan not found")
    }

    const limits = tierLimits(session.planTier)
    const projectCount = await db.project.count({ where: { planId: plan.id } })
    if (projectCount >= limits.maxProjects) {
      return apiPlanLimit(
        "PROJECT_LIMIT",
        `Reached the cap of ${limits.maxProjects} projects for your plan.`,
      )
    }

    const defaultAreaId = await findDefaultAreaIdForCategory(
      session.userId,
      parsed.data.category,
    )

    const project = await db.project.create({
      data: {
        ...parsed.data,
        areaId: defaultAreaId,
        description: sanitizeRichTextHtml(parsed.data.description) || null,
        sortOrder: projectCount,
      },
    })

    return apiCreated(project)
  })
}
