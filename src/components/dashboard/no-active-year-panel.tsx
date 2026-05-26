"use client"

import Link from "next/link"
import { Archive, ArrowRight, Calendar, Sparkles } from "lucide-react"

export function NoActiveYearPanel() {
  return (
    <section className="rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center max-w-lg mx-auto">
      <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-muted/60 mb-4">
        <Archive className="h-4 w-4 text-muted-foreground" />
      </div>
      <h2 className="font-display text-2xl tracking-tight">No active year</h2>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
        Your year is archived. Revisit it in Wrapped, or start a fresh year in
        Settings when you&apos;re ready to plan again.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/wrapped"
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-sm hover:bg-accent transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5" />
          View Wrapped
        </Link>
        <Link
          href="/settings#your-year"
          className="inline-flex items-center gap-1.5 rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Calendar className="h-3.5 w-3.5" />
          Your year in Settings
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  )
}
