import { Eyebrow } from "@/components/atmosphere/eyebrow"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  /** Small uppercase amber kicker text above the title. */
  eyebrow?: React.ReactNode
  title: string
  description?: string
  /**
   * Inline actions (button, dropdown) rendered on the right at `sm+`.
   * Preferred over `children` for new code.
   */
  actions?: React.ReactNode
  /**
   * Legacy alias for `actions` — older pages pass actions as `children`.
   * Continues to work; both render in the same slot.
   */
  children?: React.ReactNode
  /** Render-time hint for skeleton/loading parity. Title still renders. */
  loading?: boolean
  className?: string
}

/**
 * Top-of-page header used by every authenticated dashboard surface.
 *
 * Composition order:
 *   1. Optional eyebrow (amber kicker)
 *   2. Title (display font, h1)
 *   3. Optional description (muted, max-w-xl)
 *   4. Optional actions, right-aligned on `sm+`
 *
 * Pair with `<PageContainer>` for full page rhythm.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  children,
  loading,
  className,
}: PageHeaderProps) {
  const rightSlot = actions ?? children

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div>
        {eyebrow && <Eyebrow className="mb-2">{eyebrow}</Eyebrow>}
        <h1
          className={cn(
            "font-display text-3xl md:text-4xl font-semibold tracking-tight",
            loading && "opacity-60",
          )}
        >
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground mt-2 max-w-xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {rightSlot && (
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:shrink-0">
          {rightSlot}
        </div>
      )}
    </div>
  )
}
