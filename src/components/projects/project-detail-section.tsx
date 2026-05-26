"use client"

import { useState } from "react"
import * as Collapsible from "@radix-ui/react-collapsible"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProjectDetailSectionProps {
  title: string
  count?: number
  /** Shown on the collapsed trigger when the section is closed. */
  hint?: string
  defaultOpen?: boolean
  children: React.ReactNode
}

/**
 * Collapsible secondary section on the project detail page.
 * Primary execution blocks (header, tasks, systems, motivation) stay expanded.
 */
export function ProjectDetailSection({
  title,
  count,
  hint,
  defaultOpen = false,
  children,
}: ProjectDetailSectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  const label = count !== undefined ? `${title} (${count})` : title

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <Collapsible.Trigger className="flex w-full min-h-11 items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30 sm:px-5 sm:py-4">
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
              open && "rotate-180",
            )}
          />
          <span className="font-display text-base tracking-tight flex-1 min-w-0">
            {label}
          </span>
          {!open && hint ? (
            <span className="text-xs text-muted-foreground truncate max-w-[40%] sm:max-w-[50%]">
              {hint}
            </span>
          ) : null}
        </Collapsible.Trigger>
        <Collapsible.Content className="border-t border-border px-4 py-4 sm:px-5 sm:py-5">
          {children}
        </Collapsible.Content>
      </div>
    </Collapsible.Root>
  )
}
