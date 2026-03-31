import { cn } from "@/lib/utils"

type AppContentVariant = "narrow" | "wide"

const variantClass: Record<AppContentVariant, string> = {
  narrow: "max-w-2xl",
  wide: "max-w-6xl",
}

export function AppContent({
  variant = "wide",
  className,
  children,
}: {
  variant?: AppContentVariant
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("mx-auto w-full", variantClass[variant], className)}>
      {children}
    </div>
  )
}
