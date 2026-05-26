import { z } from "zod"
import { hasProProductAccess } from "@/lib/plan-access"
import {
  loadActivePlanWithProjects,
  projectIntentionsInvalid,
  upsertQuarterlyPlan,
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
  quarter: z.enum(["Q1", "Q2", "Q3", "Q4"]),
  year: z.number().int(),
  quarterFocus: z.string().max(5000).optional(),
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
        { error: "Quarterly planning is a Pro feature. Upgrade to unlock." },
        { status: 403 },
      )
    }

    const body = await parseJsonBody(req)
    const parsed = upsertSchema.safeParse(body)
    if (!parsed.success) {
      return apiInvalidInput(parsed.error.flatten())
    }

    const { planId, quarter, year, quarterFocus, projectIntentions, topIntentions } =
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

    const row = await upsertQuarterlyPlan({
      planId,
      quarter,
      year,
      payload: { focus: quarterFocus, projectIntentions, topIntentions },
    })

    return apiOk(row)
  })
}
