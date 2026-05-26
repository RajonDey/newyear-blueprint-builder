"use client"

import { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { toast } from "sonner"

function exportFilenameFromResponse(res: Response): string {
  const disposition = res.headers.get("Content-Disposition") ?? ""
  const match = disposition.match(/filename="([^"]+)"/)
  if (match?.[1]) return match[1]
  const day = new Date().toISOString().slice(0, 10)
  return `yearinreview-export-${day}.json`
}

export function DataExportSection() {
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    setExporting(true)
    try {
      const res = await fetch("/api/export")
      if (res.status === 429) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error || "You can export once per hour")
      }
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error || "Export failed")
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = exportFilenameFromResponse(res)
      anchor.click()
      URL.revokeObjectURL(url)
      toast.success("Export downloaded")
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Export failed")
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border/70 bg-card/40 p-5 space-y-4">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Download a JSON file with your plans, projects, reflections, notes,
        resources (metadata only — not uploaded files), and rhythm history.
        Free and Pro include the same export.
      </p>
      <button
        type="button"
        onClick={handleExport}
        disabled={exporting}
        className="inline-flex items-center gap-1.5 rounded-md bg-foreground text-background px-3 py-1.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {exporting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Download className="h-3.5 w-3.5" />
        )}
        Export your data
      </button>
      <p className="text-xs text-muted-foreground">
        Limited to one export per hour. Save a copy before deleting your account.
      </p>
    </div>
  )
}
