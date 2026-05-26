"use client"

import { useState } from "react"
import { Plus, Minus } from "lucide-react"

interface FaqItem {
  q: string
  a: string
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="max-w-2xl mx-auto rounded-2xl border border-border bg-card divide-y divide-border">
      {items.map((f, i) => {
        const isOpen = open === i
        return (
          <div key={f.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span className="font-display text-base md:text-lg tracking-tight">
                {f.q}
              </span>
              {isOpen ? (
                <Minus className="h-4 w-4 text-amber shrink-0" />
              ) : (
                <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
            </button>
            {isOpen && (
              <div className="px-6 pb-5 -mt-2 text-sm text-muted-foreground leading-relaxed">
                {f.a}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
