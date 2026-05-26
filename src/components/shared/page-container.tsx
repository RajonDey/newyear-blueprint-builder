import { cn } from "@/lib/utils"
import { AppContent } from "@/components/shared/app-content"

type Width = "narrow" | "medium" | "wide"
type Spacing = "compact" | "default" | "generous"

const spacingClass: Record<Spacing, string> = {
  compact: "space-y-6",
  default: "space-y-8 md:space-y-10",
  generous: "space-y-10 md:space-y-12",
}

interface PageContainerProps {
  /**
   * Max-width preset.
   * - `wide` (max-w-6xl): most dashboard pages including `/rhythm/*`.
   * - `medium` (max-w-3xl): focused single-column forms (settings, plan-new).
   */
  width?: Width
  /** Vertical rhythm between top-level children. */
  spacing?: Spacing
  className?: string
  children: React.ReactNode
}

/**
 * Top-level wrapper for every authenticated dashboard page.
 *
 * Combines the existing `<AppContent>` max-width with a calm vertical rhythm,
 * so individual pages can just drop in their `<PageHeader />` and sections
 * without re-deriving spacing each time.
 *
 * @example
 * ```tsx
 * <PageContainer>
 *   <PageHeader eyebrow="Today" title="Welcome back" />
 *   <section>…</section>
 *   <section>…</section>
 * </PageContainer>
 * ```
 */
export function PageContainer({
  width = "wide",
  spacing = "default",
  className,
  children,
}: PageContainerProps) {
  return (
    <AppContent variant={width}>
      <div className={cn(spacingClass[spacing], className)}>{children}</div>
    </AppContent>
  )
}
