import { z } from "zod"
import { hasProProductAccess } from "@/lib/plan-access"
import {
  loadActivePlanWithProjects,
  projectIntentionsInvalid,
  upsertMonthlyPlan,
} from "@/lib/cadence-plan-upsert"
import {
  apiInvalidInput,
  apiNotFound,
  apiOk,
  handleApiRoute,
  isApiError,
  parseJsonBody,
  requireApiSession,
} from "@/lib/api-route"
import { NextResponse } from "next/server"

const upsertSchema = z.object({
  planId: z.string().min(1),
  month: z.number().min(1).max(12),
  year: z.number().int(),
  monthFocus: z.string().max(5000).optional(),
  projectIntentions: z
    .array(
      z.object({
        projectId: z.string().min(1),
        text: z.string().max(500).trim(),
      }),
    )
    .optional(),
  topIntentions: z.array(z.string().max(500).trim()).max(3).optional(),
})

export async function PUT(req: Request) {
  return handleApiRoute(async () => {
    const session = await requireApiSession()
    if (isApiError(session)) return session

    if (
      !hasProProductAccess(
        session.planTier,
        session.role as "USER" | "ADMIN",
      )
    ) {
      return NextResponse.json(
        { error: "Monthly planning is a Pro feature. Upgrade to unlock." },
        { status: 403 },
      )
    }

    const body = await parseJsonBody(req)
    const parsed = upsertSchema.safeParse(body)
    if (!parsed.success) {
      return apiInvalidInput(parsed.error.flatten())
    }

    const { planId, month, year, monthFocus, projectIntentions, topIntentions } =
      parsed.data

    const plan = await loadActivePlanWithProjects(planId, session.userId)
    if (!plan) {
      return apiNotFound("Plan not found")
    }

    const allowed = new Set(plan.projects.map((p) => p.id))
    if (projectIntentionsInvalid(projectIntentions, allowed)) {
      return NextResponse.json(
        {
          error:
            "Project intentions must reference active projects on this plan.",
        },
        { status: 400 },
      )
    }

    const row = await upsertMonthlyPlan({
      planId,
      month,
      year,
      payload: { focus: monthFocus, projectIntentions, topIntentions },
    })

    return apiOk(row)
  })
}
