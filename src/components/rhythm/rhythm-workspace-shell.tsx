import { cn } from "@/lib/utils"

interface RhythmWorkspaceShellProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  /** On viewports below `lg`, stack sidebar below main (default) or above. */
  sidebarFirstOnMobile?: boolean
  className?: string
}

/**
 * Shared two-column rhythm layout — main workspace + context sidebar.
 *
 * On `lg+`, each column scrolls independently inside the viewport so the
 * sidebar stays put while the plan/review form scrolls (and vice versa).
 * Below `lg`, columns stack and the app `main` scroll handles everything.
 */
export function RhythmWorkspaceShell({
  children,
  sidebar,
  sidebarFirstOnMobile = false,
  className,
}: RhythmWorkspaceShellProps) {
  if (!sidebar) {
    return <div className={cn("min-w-0", className)}>{children}</div>
  }

  return (
    <div
      className={cn(
        "grid gap-8 lg:grid-cols-[minmax(0,1fr)_min(100%,320px)]",
        "lg:min-h-0 lg:flex-1 lg:overflow-hidden",
        className,
      )}
    >
      <div
        className={cn(
          "min-w-0",
          sidebarFirstOnMobile ? "order-2 lg:order-1" : "order-1",
          "lg:min-h-0 lg:overflow-y-auto lg:overscroll-y-contain",
        )}
      >
        {children}
      </div>
      <aside
        className={cn(
          "space-y-4",
          sidebarFirstOnMobile ? "order-1 lg:order-2" : "order-2",
          "lg:min-h-0 lg:overflow-y-auto lg:overscroll-y-contain",
        )}
      >
        {sidebar}
      </aside>
    </div>
  )
}

/** Use on rhythm workspace pages so the shell can fill the app viewport below the topbar. */
export const rhythmWorkspacePageClass =
  "space-y-4 lg:space-y-0 lg:flex lg:flex-col lg:gap-4 lg:min-h-0 lg:h-[calc(100dvh-3.5rem-3rem)] lg:max-h-[calc(100dvh-3.5rem-3rem)]"
