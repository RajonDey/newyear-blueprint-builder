import { z } from "zod"
import { ParentType } from "@prisma/client"
import { db } from "@/lib/db"
import { assertParentBelongsToUser } from "@/lib/parent-guard"
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

const createSchema = z.object({
  parentType: z.nativeEnum(ParentType),
  parentId: z.string().trim().min(1),
  content: z.string().trim().min(1).max(10_000),
  pinned: z.boolean().optional(),
})

/**
 * POST /api/notes — create a note on any PARA parent.
 */
export async function POST(req: Request) {
  return handleApiRoute(async () => {
    const session = await requireApiSession()
    if (isApiError(session)) return session

    const body = await parseJsonBody(req)
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return apiInvalidInput(parsed.error.flatten())
    }

    const ok = await assertParentBelongsToUser(
      session.userId,
      parsed.data.parentType,
      parsed.data.parentId,
    )
    if (!ok) {
      return apiNotFound("Parent not found")
    }

    const limits = tierLimits(session.planTier)
    const total = await db.note.count({ where: { userId: session.userId } })
    if (total >= limits.maxNotes) {
      return apiPlanLimit(
        "NOTE_LIMIT",
        `Reached the cap of ${limits.maxNotes} notes for your plan.`,
      )
    }

    const note = await db.note.create({
      data: {
        userId: session.userId,
        parentType: parsed.data.parentType,
        parentId: parsed.data.parentId,
        content: parsed.data.content,
        pinned: parsed.data.pinned ?? false,
      },
    })

    return apiCreated(note)
  })
}
