import { NextResponse } from "next/server"
import { z } from "zod"
import { ParentType, ResourceKind } from "@prisma/client"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { planLimits } from "@/lib/config"
import { assertParentBelongsToUser } from "@/lib/parent-guard"

const createLinkSchema = z.object({
  parentType: z.nativeEnum(ParentType),
  parentId: z.string().trim().min(1),
  title: z.string().trim().min(1).max(200),
  url: z.string().url(),
})

/**
 * POST /api/resources — create a LINK resource (Free + Pro).
 *
 * File-kind resources go through `POST /api/resources/upload` instead, where
 * we receive the file directly and write it to Vercel Blob server-side.
 */
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = createLinkSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const ok = await assertParentBelongsToUser(
    session.user.id,
    parsed.data.parentType,
    parsed.data.parentId,
  )
  if (!ok) {
    return NextResponse.json({ error: "Parent not found" }, { status: 404 })
  }

  const limits = planLimits[session.user.planTier]
  const total = await db.resource.count({
    where: { userId: session.user.id },
  })
  if (total >= limits.maxResources) {
    return NextResponse.json(
      {
        error: "RESOURCE_LIMIT",
        message: `Reached the cap of ${limits.maxResources} resources for your plan.`,
        upgradeUrl: "/pricing",
      },
      { status: 402 },
    )
  }

  const resource = await db.resource.create({
    data: {
      userId: session.user.id,
      parentType: parsed.data.parentType,
      parentId: parsed.data.parentId,
      kind: ResourceKind.LINK,
      title: parsed.data.title,
      url: parsed.data.url,
    },
  })

  return NextResponse.json({ data: resource }, { status: 201 })
}
