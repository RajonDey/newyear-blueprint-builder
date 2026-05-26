import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import {
  buildUserExport,
  ExportTooLargeError,
} from "@/lib/queries/user-export"
import { rateLimitExportIfConfigured } from "@/lib/rate-limit-export"

function exportFilename(isoDate: string): string {
  const day = isoDate.slice(0, 10)
  return `yearinreview-export-${day}.json`
}

/**
 * GET /api/export
 *
 * Downloads a JSON bundle of all user-created data. Rate-limited to 1/hour
 * when Upstash is configured.
 */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const limited = await rateLimitExportIfConfigured(session.user.id)
  if (limited) return limited

  try {
    const bundle = await buildUserExport(session.user.id)
    const body = JSON.stringify(bundle, null, 2)

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${exportFilename(bundle.meta.exportedAt)}"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    if (error instanceof ExportTooLargeError) {
      return NextResponse.json(
        {
          error:
            "Your account has too much data for a single export. Contact support for help.",
          rowCount: error.rowCount,
        },
        { status: 413 },
      )
    }
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}
