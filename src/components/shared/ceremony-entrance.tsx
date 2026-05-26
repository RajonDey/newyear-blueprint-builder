/* Hallmark · design-system: design.md · designed-as-app
 * Ceremony entrance — opacity-only first paint (§6, §11 Special pages).
 */

import { cn } from "@/lib/utils"

export function CeremonySequence({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn("ceremony-sequence", className)}>{children}</div>
}

export function CeremonyStep({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  /** Stagger delay in ms */
  delay?: number
  className?: string
}) {
  return (
    <div
      className={cn("ceremony-step", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
