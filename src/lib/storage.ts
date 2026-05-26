import { del, put } from "@vercel/blob"

/**
 * Vercel Blob storage helpers — Phase 5.
 *
 * We use **server-side direct upload** (not client presigned URLs) for two
 * reasons:
 *   1. Quota enforcement: the server is the only place we can atomically
 *      check the user's per-tier `maxResourceFileBytes` + remaining
 *      `maxResourceStorageBytes` budget before accepting the bytes.
 *   2. MIME / size validation lives in one place. A client-side presigned
 *      URL would let a Free user bypass the file-upload paywall by guessing
 *      the bucket path.
 *
 * Free users never reach this module — the `/api/resources` route returns
 * HTTP 402 before any Blob write happens (protects unit economics).
 *
 * Requires:
 *   - `BLOB_READ_WRITE_TOKEN` in `.env.local` (and Vercel project env)
 */

const BUCKET_PREFIX = "resources"

/** Build a stable but unguessable path: `resources/<userId>/<uuid>/<safeName>`. */
function buildPath(userId: string, originalName: string): string {
  const safeName = originalName
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "_")
    .slice(0, 120)
  const uuid = crypto.randomUUID()
  return `${BUCKET_PREFIX}/${userId}/${uuid}/${safeName}`
}

export interface UploadedBlob {
  url: string
  pathname: string
  contentType: string | null
  size: number
}

/**
 * Upload a file to Vercel Blob and return its public URL.
 *
 * Callers are responsible for quota enforcement before invoking this.
 */
export async function uploadResourceFile(args: {
  userId: string
  filename: string
  body: ArrayBuffer | Blob
  contentType?: string
}): Promise<UploadedBlob> {
  const path = buildPath(args.userId, args.filename)
  const result = await put(path, args.body, {
    access: "public",
    contentType: args.contentType,
    addRandomSuffix: false,
  })
  const size =
    args.body instanceof Blob ? args.body.size : args.body.byteLength
  return {
    url: result.url,
    pathname: result.pathname,
    contentType: args.contentType ?? null,
    size,
  }
}

/**
 * Delete a previously uploaded blob. Safe to call with a URL that has
 * already been removed — the underlying `del` SDK is idempotent.
 */
export async function deleteResourceFile(url: string): Promise<void> {
  try {
    await del(url)
  } catch (err) {
    // Soft-fail: if the blob is already gone (or the token is unset in dev),
    // we still want the DB row to be removed by the caller. Surface the
    // error to logs but don't break the request.
    console.warn("[storage] del() failed", err)
  }
}
