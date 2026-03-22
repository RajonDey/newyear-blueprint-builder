"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Target,
  CalendarCheck,
  Activity,
  BarChart3,
  Gift,
  Settings,
  Sparkles,
  ListChecks,
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { hasProProductAccess } from "@/lib/plan-access"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { PlanTier, Role } from "@prisma/client"

interface AppSidebarProps {
  user: {
    name?: string | null
    planTier: PlanTier
    role: Role
  }
}

const navigationBase = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "Daily Systems", href: "/rhythm/daily", icon: ListChecks },
  { label: "Weekly rhythm", href: "/rhythm/weekly", icon: CalendarCheck },
  { label: "divider", href: "", icon: Activity },
  { label: "Analytics", href: "/analytics", icon: BarChart3, premium: true },
  {
    label: "Quarterly Review",
    href: "/rhythm/quarterly",
    icon: Activity,
    premium: true,
  },
  { label: "Year Wrapped", href: "/wrapped", icon: Gift },
  { label: "divider2", href: "", icon: Settings },
  { label: "Settings", href: "/settings", icon: Settings },
]

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname()
  const isPro = hasProProductAccess(user.planTier, user.role)

  const navigation =
    user.role === "ADMIN"
      ? [
          ...navigationBase.slice(0, -2),
          { label: "Admin", href: "/admin", icon: Shield },
          ...navigationBase.slice(-2),
        ]
      : navigationBase

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-sidebar">
      <div className="flex h-16 items-center border-b px-6 gap-2.5">
        <svg
          viewBox="0 0 28 28"
          fill="none"
          className="h-6 w-6 text-sidebar-primary"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="14" cy="14" r="7" stroke="currentColor" strokeWidth="1" opacity="0.6" />
          <circle cx="14" cy="14" r="2.5" fill="currentColor" opacity="0.4" />
        </svg>
        <Link href="/dashboard">
          <span className="text-lg font-display font-semibold tracking-wide text-sidebar-foreground">
            YearInReview
          </span>
        </Link>
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            if (item.label.startsWith("divider")) {
              return (
                <div
                  key={item.label}
                  className="my-3 h-px bg-sidebar-border"
                />
              )
            }

            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/")

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.premium && !isPro && (
                  <Sparkles className="h-3 w-3 text-accent" />
                )}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
      {!isPro && (
        <div className="border-t p-4">
          <Link
            href="/settings#billing"
            className="flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Upgrade to Pro
          </Link>
        </div>
      )}
    </aside>
  )
}
