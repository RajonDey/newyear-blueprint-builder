import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { deleteResourceFile } from "@/lib/storage"

async function resourceForUser(resourceId: string, userId: string) {
  return db.resource.findFirst({ where: { id: resourceId, userId } })
}

/**
 * In-place edit for LINK resources. We intentionally do NOT let users edit
 * FILE rows from this endpoint: the blob path is derived from the original
 * filename on upload, and re-pointing the URL while leaving the underlying
 * blob untouched would be confusing. To "change" a file resource users
 * delete + re-upload.
 */
const patchSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  url: z.string().trim().url().max(2000).optional(),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ resourceId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { resourceId } = await params
  const existing = await resourceForUser(resourceId, session.user.id)
  if (!existing) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 })
  }
  if (existing.kind === "FILE") {
    return NextResponse.json(
      {
        error: "FILE_RESOURCE",
        message: "File resources can't be edited — delete and re-upload.",
      },
      { status: 400 },
    )
  }

  const body = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const updated = await db.resource.update({
    where: { id: resourceId },
    data: {
      title: parsed.data.title,
      url: parsed.data.url,
    },
  })

  return NextResponse.json({ data: updated })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ resourceId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { resourceId } = await params
  const existing = await resourceForUser(resourceId, session.user.id)
  if (!existing) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 })
  }

  // For FILE resources, attempt to remove the underlying blob first. If
  // Vercel Blob is unreachable we still remove the DB row — orphaned blobs
  // are handled by a periodic janitor (not implemented yet).
  if (existing.kind === "FILE") {
    await deleteResourceFile(existing.url)
  }

  await db.resource.delete({ where: { id: resourceId } })
  return NextResponse.json({ ok: true })
}
