"use client"

/* Hallmark · design-system: design.md · designed-as-app
 * Recap share actions — silent clipboard success (Wave G).
 */

import { Download, Share2 } from "lucide-react"
import { toast } from "sonner"

export function RecapActions({ title }: { title: string }) {
  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : ""
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // user dismissed — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      toast.error("Could not copy link")
    }
  }

  return (
    <div className="flex items-center gap-2 print:hidden">
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3.5 py-1.5 text-xs font-medium hover:bg-accent/10 transition-colors"
      >
        <Download className="h-3.5 w-3.5" /> Download
      </button>
      <button
        type="button"
        onClick={share}
        className="inline-flex items-center gap-1.5 rounded-md bg-foreground text-background px-3.5 py-1.5 text-xs font-medium hover:opacity-90 transition-opacity"
      >
        <Share2 className="h-3.5 w-3.5" /> Share
      </button>
    </div>
  )
}
