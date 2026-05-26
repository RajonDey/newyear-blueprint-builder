import { cn } from "@/lib/utils"
import { Eyebrow } from "@/components/atmosphere/eyebrow"

interface SectionHeaderProps {
  /** Small uppercase amber kicker text above the title. */
  eyebrow?: React.ReactNode
  /** Section title — rendered as an `<h2>` in display font. */
  title: string
  /** Optional supporting line beneath the title. */
  description?: string
  /** Optional inline actions (button, link) rendered on the right on `sm+`. */
  actions?: React.ReactNode
  /** Size preset for the title. Use `lg` for hero-ish in-page sections. */
  size?: "sm" | "md" | "lg"
  className?: string
}

const titleClass: Record<NonNullable<SectionHeaderProps["size"]>, string> = {
  sm: "text-xl md:text-2xl",
  md: "text-2xl md:text-3xl",
  lg: "text-3xl md:text-4xl",
}

/**
 * In-page section header — eyebrow + h2 + optional description + optional actions.
 *
 * Use inside a `<PageContainer>` to introduce a section under the main `<PageHeader>`.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  size = "md",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div>
        {eyebrow && <Eyebrow className="mb-2">{eyebrow}</Eyebrow>}
        <h2
          className={cn(
            "font-display font-semibold tracking-tight leading-[1.15]",
            titleClass[size],
          )}
        >
          {title}
        </h2>
        {description && (
          <p className="text-muted-foreground mt-2 max-w-xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  )
}
