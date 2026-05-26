"use client"

/* Hallmark · design-system: design.md · designed-as-app */

import { useState } from "react"
import * as Collapsible from "@radix-ui/react-collapsible"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProjectDetailSectionProps {
  title: string
  count?: number
  hint?: string
  defaultOpen?: boolean
  children: React.ReactNode
}

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
      <div className="border-y border-border">
        <Collapsible.Trigger className="flex w-full min-h-11 items-center gap-3 py-3.5 text-left transition-colors hover:bg-muted/30">
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
        <Collapsible.Content className="border-t border-border py-4">
          {children}
        </Collapsible.Content>
      </div>
    </Collapsible.Root>
  )
}
