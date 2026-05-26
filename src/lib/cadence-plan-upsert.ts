import type { Quarter } from "@prisma/client"
import { db } from "@/lib/db"
import { sanitizeRichTextHtml } from "@/lib/sanitize"

export type ProjectIntentionInput = {
  projectId: string
  text: string
}

export type CadencePlanPayload = {
  focus?: string
  projectIntentions?: ProjectIntentionInput[]
  topIntentions?: string[]
}

export async function loadActivePlanWithProjects(planId: string, userId: string) {
  return db.yearlyPlan.findFirst({
    where: { id: planId, userId, status: "ACTIVE" },
    include: {
      projects: {
        where: { status: { not: "COMPLETED" } },
        select: { id: true },
      },
    },
  })
}

export function projectIntentionsInvalid(
  intentions: ProjectIntentionInput[] | undefined,
  allowed: Set<string>,
): boolean {
  return Boolean(intentions?.some((row) => !allowed.has(row.projectId)))
}

export function sanitizeCadencePlanPayload(payload: CadencePlanPayload) {
  const safeFocus =
    payload.focus !== undefined
      ? sanitizeRichTextHtml(payload.focus) || null
      : undefined

  const safeIntentions = payload.projectIntentions
    ?.map((row) => ({
      projectId: row.projectId,
      text: sanitizeRichTextHtml(row.text),
    }))
    .filter((row) => row.text.length > 0)

  const safeTop = payload.topIntentions
    ?.map((s) => sanitizeRichTextHtml(s).replace(/<[^>]+>/g, " ").trim())
    .filter(Boolean)

  return { safeFocus, safeIntentions, safeTop }
}

export async function upsertMonthlyPlan(args: {
  planId: string
  month: number
  year: number
  payload: CadencePlanPayload
}) {
  const { safeFocus, safeIntentions, safeTop } = sanitizeCadencePlanPayload(
    args.payload,
  )

  return db.monthlyPlan.upsert({
    where: {
      planId_month_year: {
        planId: args.planId,
        month: args.month,
        year: args.year,
      },
    },
    create: {
      planId: args.planId,
      month: args.month,
      year: args.year,
      monthFocus: safeFocus ?? null,
      projectIntentions: safeIntentions ?? [],
      topIntentions: safeTop ?? [],
    },
    update: {
      ...(safeFocus !== undefined && { monthFocus: safeFocus }),
      ...(safeIntentions !== undefined && { projectIntentions: safeIntentions }),
      ...(safeTop !== undefined && { topIntentions: safeTop }),
    },
  })
}

export async function upsertQuarterlyPlan(args: {
  planId: string
  quarter: Quarter
  year: number
  payload: CadencePlanPayload
}) {
  const { safeFocus, safeIntentions, safeTop } = sanitizeCadencePlanPayload({
    focus: args.payload.focus,
    projectIntentions: args.payload.projectIntentions,
    topIntentions: args.payload.topIntentions,
  })

  return db.quarterlyPlan.upsert({
    where: {
      planId_quarter: { planId: args.planId, quarter: args.quarter },
    },
    create: {
      planId: args.planId,
      quarter: args.quarter,
      year: args.year,
      quarterFocus: safeFocus ?? null,
      projectIntentions: safeIntentions ?? [],
      topIntentions: safeTop ?? [],
    },
    update: {
      ...(safeFocus !== undefined && { quarterFocus: safeFocus }),
      ...(safeIntentions !== undefined && { projectIntentions: safeIntentions }),
      ...(safeTop !== undefined && { topIntentions: safeTop }),
      year: args.year,
    },
  })
}
