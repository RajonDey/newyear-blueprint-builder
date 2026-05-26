import { ParentType, ResourceKind } from "@prisma/client"
import { db } from "@/lib/db"
import { assertParentBelongsToUser } from "@/lib/parent-guard"
import { uploadResourceFile, deleteResourceFile } from "@/lib/storage"
import { totalResourceStorageBytes } from "@/lib/queries/resources"
import {
  apiCreated,
  apiPlanLimit,
  handleApiRoute,
  isApiError,
  requireApiSession,
  tierLimits,
} from "@/lib/api-route"
import { NextResponse } from "next/server"

/**
 * POST /api/resources/upload — Pro-only file upload to Vercel Blob.
 */
export async function POST(req: Request) {
  return handleApiRoute(async () => {
    const session = await requireApiSession()
    if (isApiError(session)) return session

    const limits = tierLimits(session.planTier)
    if (!limits.canUploadResourceFiles) {
      return apiPlanLimit(
        "FILE_UPLOAD_PRO_ONLY",
        "File uploads are a Pro feature.",
      )
    }

    let form: FormData
    try {
      form = await req.formData()
    } catch {
      return NextResponse.json(
        { error: "Invalid multipart payload" },
        { status: 400 },
      )
    }

    const file = form.get("file")
    const parentType = form.get("parentType")
    const parentId = form.get("parentId")
    const titleRaw = form.get("title")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 })
    }
    if (typeof parentType !== "string" || typeof parentId !== "string") {
      return NextResponse.json({ error: "Missing parent" }, { status: 400 })
    }
    if (
      !Object.values(ParentType).includes(parentType as ParentType) ||
      parentId.trim() === ""
    ) {
      return NextResponse.json({ error: "Invalid parent" }, { status: 400 })
    }

    if (file.size <= 0) {
      return NextResponse.json({ error: "Empty file" }, { status: 400 })
    }
    if (file.size > limits.maxResourceFileBytes) {
      const mb = Math.round(limits.maxResourceFileBytes / (1024 * 1024))
      return NextResponse.json(
        {
          error: "FILE_TOO_LARGE",
          message: `File exceeds the ${mb} MB per-file cap.`,
        },
        { status: 413 },
      )
    }

    const ok = await assertParentBelongsToUser(
      session.userId,
      parentType as ParentType,
      parentId,
    )
    if (!ok) {
      return NextResponse.json({ error: "Parent not found" }, { status: 404 })
    }

    const [totalCount, usedBytes] = await Promise.all([
      db.resource.count({ where: { userId: session.userId } }),
      totalResourceStorageBytes(session.userId),
    ])
    if (totalCount >= limits.maxResources) {
      return apiPlanLimit(
        "RESOURCE_LIMIT",
        `Reached the cap of ${limits.maxResources} resources for your plan.`,
      )
    }
    if (usedBytes + file.size > limits.maxResourceStorageBytes) {
      const gb = (limits.maxResourceStorageBytes / 1024 ** 3).toFixed(1)
      return apiPlanLimit(
        "STORAGE_LIMIT",
        `This upload would exceed your ${gb} GB storage budget.`,
      )
    }

    const title =
      typeof titleRaw === "string" && titleRaw.trim().length > 0
        ? titleRaw.trim().slice(0, 200)
        : file.name.slice(0, 200)

    const uploaded = await uploadResourceFile({
      userId: session.userId,
      filename: file.name,
      body: await file.arrayBuffer(),
      contentType: file.type || undefined,
    })

    try {
      const resource = await db.resource.create({
        data: {
          userId: session.userId,
          parentType: parentType as ParentType,
          parentId,
          kind: ResourceKind.FILE,
          title,
          url: uploaded.url,
          mimeType: uploaded.contentType,
          sizeBytes: uploaded.size,
        },
      })
      return apiCreated(resource)
    } catch (err) {
      await deleteResourceFile(uploaded.url)
      throw err
    }
  })
}

export const runtime = "nodejs"
export const maxDuration = 60
export const dynamic = "force-dynamic"
