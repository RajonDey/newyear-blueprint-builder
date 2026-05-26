import { cn } from "@/lib/utils"

interface RhythmWorkspaceShellProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  /** On viewports below `lg`, stack sidebar below main (default) or above. */
  sidebarFirstOnMobile?: boolean
  className?: string
}

/**
 * Shared two-column rhythm layout — main workspace + sticky context sidebar.
 * Used by every cadence page so wide containers feel intentional, not empty.
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
        className,
      )}
    >
      <div
        className={cn(
          "min-w-0",
          sidebarFirstOnMobile ? "order-2 lg:order-1" : "order-1",
        )}
      >
        {children}
      </div>
      <aside
        className={cn(
          "space-y-4 lg:sticky lg:top-6 lg:self-start",
          sidebarFirstOnMobile ? "order-1 lg:order-2" : "order-2",
        )}
      >
        {sidebar}
      </aside>
    </div>
  )
}
