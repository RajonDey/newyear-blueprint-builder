"use client"

/* Hallmark · design-system: design.md · designed-as-app
 * FAQ accordion — hairline rows, no card stack (Wave E).
 */

import { useState } from "react"
import { Plus, Minus } from "lucide-react"

interface FaqItem {
  q: string
  a: string
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="max-w-2xl border-y border-border divide-y divide-border">
      {items.map((f, i) => {
        const isOpen = open === i
        return (
          <div key={f.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full flex items-start justify-between gap-4 py-5 text-left transition-colors hover:text-foreground"
            >
              <span className="font-display text-base md:text-lg tracking-tight text-foreground">
                {f.q}
              </span>
              <span className="mt-1 shrink-0 text-muted-foreground" aria-hidden>
                {isOpen ? (
                  <Minus className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </span>
            </button>
            {isOpen && (
              <p className="pb-5 text-sm md:text-base text-muted-foreground leading-relaxed pr-8">
                {f.a}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
