import {
  CadenceContextBanner,
  CadenceContextRichText,
} from "@/components/check-in/cadence-context-banner"
import type { QuarterlyFocusContext } from "@/lib/queries/rhythm-context"
import { Activity } from "lucide-react"

export function QuarterlyFocusPanel({
  context,
}: {
  context: QuarterlyFocusContext | null | undefined
}) {
  if (!context) return null

  const hasFocus = Boolean(context.focusText?.trim())
  const hasIntentions = Boolean(context.topIntentions?.length)

  if (!hasFocus && !hasIntentions) return null

  return (
    <div className="space-y-3">
      {hasFocus && (
        <CadenceContextBanner
          icon={<Activity className="h-4 w-4" />}
          title={
            context.source === "plan"
              ? `${context.quarter} plan focus`
              : `${context.quarter} season focus (review)`
          }
        >
          <CadenceContextRichText html={context.focusText} />
        </CadenceContextBanner>
      )}
      {hasIntentions && (
        <div className="rounded-lg border border-border bg-card px-4 py-3 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {context.quarter} plan — top intentions
          </p>
          <ul className="space-y-1.5 text-sm">
            {context.topIntentions!.map((line, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-accent font-medium tabular-nums shrink-0">
                  {i + 1}.
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
