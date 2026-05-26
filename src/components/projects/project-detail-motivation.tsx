"use client"

import { OrnamentDivider } from "@/components/shared/ornament-divider"
import { Heart } from "lucide-react"
import { sanitizeRichTextHtml } from "@/lib/sanitize-client"
import type { ProjectDetail } from "@/types/project-detail"

export function ProjectDetailMotivation({
  motivation,
}: {
  motivation: ProjectDetail["motivation"]
}) {
  const whyText = motivation?.whyText?.trim()
  const consequenceText = motivation?.consequenceText?.trim()
  const hasContent = Boolean(whyText || consequenceText)

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-4">
        <h2 className="font-display text-xl tracking-tight flex items-center gap-2">
          <Heart className="h-4 w-4 text-accent" /> Your why
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          The emotional anchor when execution gets hard.
        </p>
      </div>

      {!hasContent ? (
        <p className="text-sm text-muted-foreground">
          No motivation captured yet. Use{" "}
          <span className="text-foreground">Edit details</span> above to add why this
          matters and what&apos;s at stake.
        </p>
      ) : (
        <div className="space-y-4">
          {whyText ? (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Why this matters
              </p>
              <div
                className="text-sm prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{
                  __html: sanitizeRichTextHtml(whyText),
                }}
              />
            </div>
          ) : null}
          {whyText && consequenceText ? <OrnamentDivider variant="dot" /> : null}
          {consequenceText ? (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                What&apos;s at stake
              </p>
              <div
                className="text-sm prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{
                  __html: sanitizeRichTextHtml(consequenceText),
                }}
              />
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}
