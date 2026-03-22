"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Menu,
  X,
  LayoutDashboard,
  Target,
  CalendarCheck,
  ListChecks,
  Activity,
  BarChart3,
  Gift,
  Settings,
  Sparkles,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { hasProProductAccess } from "@/lib/plan-access"
import type { PlanTier, Role } from "@prisma/client"

const mobileNavBeforeSettings: {
  label: string
  href: string
  icon: typeof LayoutDashboard
  premium?: boolean
  dividerBefore?: boolean
}[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "Daily Systems", href: "/rhythm/daily", icon: ListChecks },
  { label: "Weekly rhythm", href: "/rhythm/weekly", icon: CalendarCheck },
  { label: "Analytics", href: "/analytics", icon: BarChart3, premium: true, dividerBefore: true },
  {
    label: "Quarterly Review",
    href: "/rhythm/quarterly",
    icon: Activity,
    premium: true,
  },
  { label: "Year Wrapped", href: "/wrapped", icon: Gift, dividerBefore: true },
]

interface MobileNavProps {
  planTier: PlanTier
  role: Role
}

export function MobileNav({ planTier, role }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const isPro = hasProProductAccess(planTier, role)

  const items: {
    label: string
    href: string
    icon: typeof LayoutDashboard
    premium?: boolean
    dividerBefore?: boolean
  }[] = [
    ...mobileNavBeforeSettings,
    ...(role === "ADMIN"
      ? [{ label: "Admin", href: "/admin", icon: Shield, dividerBefore: true }]
      : []),
    { label: "Settings", href: "/settings", icon: Settings, dividerBefore: true },
  ]

  function linkActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
        <Menu className="h-5 w-5" />
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 border-r bg-background p-6 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <span className="font-display text-lg font-semibold tracking-wide">
                YearInReview
              </span>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="space-y-1">
              {items.map((item) => (
                <div key={item.href}>
                  {item.dividerBefore && (
                    <div className="my-3 h-px bg-border" aria-hidden />
                  )}
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                      linkActive(item.href)
                        ? "bg-accent/10 text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.premium && !isPro && (
                      <Sparkles className="h-3.5 w-3.5 shrink-0 text-accent" />
                    )}
                  </Link>
                </div>
              ))}
            </nav>
            {!isPro && (
              <div className="mt-6 border-t pt-4">
                <Link href="/settings#billing" onClick={() => setOpen(false)}>
                  <Button className="w-full gap-2">
                    <Sparkles className="h-4 w-4" />
                    Upgrade to Pro
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
