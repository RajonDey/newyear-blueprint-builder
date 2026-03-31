"use client"

import Link from "next/link"
import { Sparkles, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PremiumGateProps {
  children?: React.ReactNode
  isPremium: boolean
  fallback?: React.ReactNode
  featureName?: string
}

export function PremiumGate({
  children,
  isPremium,
  fallback,
  featureName = "This feature",
}: PremiumGateProps) {
  if (isPremium) return <>{children}</>

  if (fallback) return <>{fallback}</>

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center space-y-4">
      <div className="rounded-full bg-primary/10 p-3">
        <Lock className="h-6 w-6 text-primary" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{featureName}</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Upgrade to Pro to unlock this feature and supercharge your year planning.
        </p>
      </div>
      <Link href="/settings#billing">
        <Button>
          <Sparkles className="mr-2 h-4 w-4" />
          Upgrade to Pro
        </Button>
      </Link>
    </div>
  )
}
