import { NextResponse } from "next/server"
import { ReviewCadence } from "@prisma/client"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { hasProProductAccess } from "@/lib/plan-access"
import {
  defaultFieldsForCadence,
  normalizeReviewTemplateFields,
} from "@/lib/review-templates"

const cadenceSchema = z.enum(["MONTHLY", "QUARTERLY"])

const patchBodySchema = z.object({
  cadence: cadenceSchema,
  fields: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      placeholder: z.string().optional(),
    }),
  ),
})

/**
 * GET /api/review-templates?cadence=MONTHLY|QUARTERLY
 *
 * Returns the persisted template or the product default field definitions.
 */
export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const sp = new URL(req.url).searchParams.get("cadence")
  const parsedCadence = cadenceSchema.safeParse(sp)
  if (!parsedCadence.success) {
    return NextResponse.json({ error: "Invalid cadence" }, { status: 400 })
  }
  const cadence = parsedCadence.data as ReviewCadence

  const row = await db.reviewTemplate.findUnique({
    where: {
      userId_cadence: { userId: session.user.id, cadence },
    },
    select: { fields: true, updatedAt: true },
  })

  const fields = normalizeReviewTemplateFields(row?.fields)
  const resolved = fields ?? defaultFieldsForCadence(cadence)

  return NextResponse.json({
    data: {
      cadence,
      fields: resolved,
      isCustom: Boolean(row && fields),
      updatedAt: row?.updatedAt ?? null,
    },
  })
}

/**
 * PATCH /api/review-templates
 *
 * Saves field definitions for Monthly or Quarterly reviews (Pro-only — same
 * gate as actually submitting a review).
 */
export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!hasProProductAccess(session.user.planTier, session.user.role)) {
    return NextResponse.json(
      { error: "Custom review templates are a Pro feature." },
      { status: 403 },
    )
  }

  const body = await req.json().catch(() => null)
  const parsed = patchBodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const normalized = normalizeReviewTemplateFields(parsed.data.fields)
  if (!normalized) {
    return NextResponse.json(
      {
        error: "Invalid fields",
        message:
          "Provide 1–12 fields with unique lowercase keys (letters, digits, underscores).",
      },
      { status: 400 },
    )
  }

  const cadence = parsed.data.cadence as ReviewCadence

  const saved = await db.reviewTemplate.upsert({
    where: {
      userId_cadence: { userId: session.user.id, cadence },
    },
    create: {
      userId: session.user.id,
      cadence,
      fields: normalized,
    },
    update: {
      fields: normalized,
    },
  })

  return NextResponse.json({
    data: {
      cadence,
      fields: normalized,
      updatedAt: saved.updatedAt,
    },
  })
}
