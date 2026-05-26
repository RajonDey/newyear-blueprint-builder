import Link from "next/link"
import { Ban } from "lucide-react"
import type { AntiGoal, LifeCategory } from "@prisma/client"

interface AntiGoalsDisplayProps {
  antiGoals: AntiGoal[]
  /** When provided, only anti-goals matching this category (or uncategorized) are shown. */
  category?: LifeCategory
  /** Optional title override. */
  title?: string
  /** Optional cap before "+ N more" overflow. */
  limit?: number
  /** Render variant. `flat` skips the card chrome. */
  variant?: "card" | "flat"
}

/**
 * Read-only AntiGoals display. The `project-display` mode mentioned in
 * `PLAN.md`: drop this on Project detail (filtered by project.category)
 * and on monthly recap pages (no filter, full list).
 *
 * Full CRUD continues to live on the dedicated `/anti-goals` page via
 * `<AntiGoalsList>`. This component is intentionally inert — it surfaces
 * the noes you've already chosen, in the place where they matter.
 */
export function AntiGoalsDisplay({
  antiGoals,
  category,
  title = "Anti-goals to honor",
  limit,
  variant = "card",
}: AntiGoalsDisplayProps) {
  const filtered = category
    ? antiGoals.filter((a) => a.category === category || a.category === null)
    : antiGoals

  if (filtered.length === 0) return null

  const visible = limit ? filtered.slice(0, limit) : filtered
  const hidden = filtered.length - visible.length

  const inner = (
    <>
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <div className="inline-flex items-center gap-1.5">
          <Ban className="h-3.5 w-3.5 text-amber" />
          <h3 className="font-display text-base tracking-tight">{title}</h3>
        </div>
        <Link
          href="/anti-goals"
          className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          Manage →
        </Link>
      </div>
      <ul className="space-y-1.5">
        {visible.map((a) => (
          <li
            key={a.id}
            className="flex items-start gap-2 text-sm leading-relaxed"
          >
            <span
              aria-hidden
              className="mt-2 h-1 w-1 rounded-full bg-amber shrink-0"
            />
            <span className="text-foreground/85">{a.description}</span>
          </li>
        ))}
      </ul>
      {hidden > 0 && (
        <div className="mt-2 text-[11px] text-muted-foreground">
          + {hidden} more on{" "}
          <Link
            href="/anti-goals"
            className="hover:text-foreground transition-colors"
          >
            /anti-goals
          </Link>
        </div>
      )}
    </>
  )

  if (variant === "flat") return <section>{inner}</section>

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      {inner}
    </section>
  )
}
