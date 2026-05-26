import { z } from "zod"
import { db } from "@/lib/db"
import { ensureDefaultAreasForUser } from "@/lib/areas/default-areas"
import {
  apiConflict,
  apiCreated,
  apiInvalidInput,
  apiPlanLimit,
  handleApiRoute,
  isApiError,
  parseJsonBody,
  requireApiSession,
  tierLimits,
} from "@/lib/api-route"
import { getPlanTheme } from "@/lib/yearly-plan/reflections"

const createSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  theme: z.string().trim().min(1).max(50),
})

export async function POST(req: Request) {
  return handleApiRoute(async () => {
    const session = await requireApiSession()
    if (isApiError(session)) return session

    const body = await parseJsonBody(req)
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return apiInvalidInput(parsed.error.flatten())
    }

    const limits = tierLimits(session.planTier)
    const userId = session.userId
    const { year, theme } = parsed.data

    const [activePlan, totalPlans, yearTaken] = await Promise.all([
      db.yearlyPlan.findFirst({
        where: { userId, status: "ACTIVE" },
        select: { id: true },
      }),
      db.yearlyPlan.count({ where: { userId } }),
      db.yearlyPlan.findUnique({
        where: { userId_year: { userId, year } },
        select: { id: true },
      }),
    ])

    if (activePlan) {
      return apiConflict(
        "Archive your current year before starting a new one.",
      )
    }

    if (yearTaken) {
      return apiConflict(`You already have a plan for ${year}.`)
    }

    if (totalPlans >= limits.maxPlans) {
      return apiPlanLimit(
        "PLAN_LIMIT",
        session.planTier === "FREE"
          ? "Free includes one year plan. Upgrade to Pro to keep multiple years."
          : `You've reached the cap of ${limits.maxPlans} year plans.`,
      )
    }

    const plan = await db.$transaction(async (tx) => {
      await ensureDefaultAreasForUser(userId, tx)
      return tx.yearlyPlan.create({
        data: {
          userId,
          year,
          status: "ACTIVE",
          reflections: { theme },
        },
        select: {
          id: true,
          year: true,
          status: true,
          reflections: true,
        },
      })
    })

    return apiCreated({
      plan,
      theme: getPlanTheme(plan.reflections),
    })
  })
}
