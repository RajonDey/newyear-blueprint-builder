"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { sanitizeRichTextHtml } from "@/lib/sanitize-client"
import { cn } from "@/lib/utils"

interface CadenceContextBannerProps {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}

/** Collapsible carry-over banner for cross-cadence context (month → week, quarter → month). */
export function CadenceContextBanner({
  icon,
  title,
  children,
  defaultOpen = true,
  className,
}: CadenceContextBannerProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div
      className={cn(
        "rounded-lg border border-accent/20 bg-accent/5 overflow-hidden",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 p-3 text-left text-sm hover:bg-accent/10 transition-colors"
      >
        <span className="shrink-0 text-accent">{icon}</span>
        <span className="flex-1 font-medium text-xs uppercase tracking-wide text-muted-foreground">
          {title}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && <div className="px-3 pb-3 pt-0 text-sm">{children}</div>}
    </div>
  )
}

export function CadenceContextRichText({ html }: { html: string }) {
  return (
    <div
      className="prose prose-sm dark:prose-invert max-w-none text-sm"
      dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(html) }}
    />
  )
}

export function CadenceContextPlainText({ text }: { text: string }) {
  return <p className="leading-relaxed text-foreground/90">{text}</p>
}
