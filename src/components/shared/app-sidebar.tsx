"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { hasProProductAccess } from "@/lib/plan-access"
import { getVisibleNavGroups, type NavLink } from "@/lib/nav-config"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ProMark } from "@/components/atmosphere/pro-mark"
import type { PlanTier, Role } from "@prisma/client"

interface AppSidebarProps {
  user: {
    name?: string | null
    planTier: PlanTier
    role: Role
  }
  driftInboxCount?: number
}

export function AppSidebar({ user, driftInboxCount = 0 }: AppSidebarProps) {
  const pathname = usePathname()
  const isPro = hasProProductAccess(user.planTier, user.role)
  const groups = getVisibleNavGroups(user.role)

  function linkActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  function renderItem(item: NavLink) {
    const active = linkActive(item.href)
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
          active
            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
            : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
        )}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate">{item.label}</span>
        {item.href === "/drifts" && driftInboxCount > 0 && (
          <span className="shrink-0 rounded-full bg-amber/15 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-amber">
            {driftInboxCount > 99 ? "99+" : driftInboxCount}
          </span>
        )}
        {item.premium && !isPro && (
          <Sparkles className="h-3 w-3 shrink-0 text-accent" aria-label="Pro" />
        )}
      </Link>
    )
  }

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background font-display text-sm font-semibold">
          Y
        </div>
        <Link href="/dashboard" className="flex flex-col leading-tight">
          <span className="font-display text-base text-sidebar-foreground">
            YearInReview
          </span>
          <span className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">
            Plan · Live · Wrap
          </span>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-6">
          {groups.map((group) => (
            <div key={group.id}>
              <div className="px-3 pb-2 text-[10px] font-medium uppercase tracking-widest text-sidebar-foreground/50">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.items.map(renderItem)}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {!isPro ? (
        <div className="border-t border-sidebar-border p-3">
          <Link
            href="/settings#billing"
            className="group block rounded-lg border border-sidebar-border bg-background/40 p-3 transition-colors hover:border-amber/40 hover:bg-amber/[0.04]"
          >
            <div className="flex items-baseline gap-2">
              <ProMark className="text-sm" />
              <div className="text-sm font-medium tracking-tight text-sidebar-foreground">
                Upgrade to Pro
              </div>
            </div>
            <div className="mt-1 text-[11px] leading-snug text-sidebar-foreground/65">
              Up to 20 projects, full reviews, annual Wrapped.
            </div>
          </Link>
        </div>
      ) : (
        <div className="border-t border-sidebar-border px-4 py-3 text-[11px] text-sidebar-foreground/65">
          <span className="inline-flex items-center gap-1.5">
            <ProMark className="text-[11px]" /> Pro plan
          </span>
        </div>
      )}
    </aside>
  )
}
