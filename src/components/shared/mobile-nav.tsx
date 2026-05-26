"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { hasProProductAccess } from "@/lib/plan-access"
import { getVisibleNavGroups } from "@/lib/nav-config"
import type { PlanTier, Role } from "@prisma/client"

interface MobileNavProps {
  planTier: PlanTier
  role: Role
  driftInboxCount?: number
}

export function MobileNav({
  planTier,
  role,
  driftInboxCount = 0,
}: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const isPro = hasProProductAccess(planTier, role)
  const groups = getVisibleNavGroups(role)

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
          <div className="absolute inset-y-0 left-0 w-72 border-r bg-background p-6 shadow-sm overflow-y-auto">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background font-display text-sm font-semibold">
                  Y
                </div>
                <span className="font-display text-lg font-semibold tracking-wide">
                  YearInReview
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="space-y-6">
              {groups.map((group) => (
                <div key={group.id}>
                  <div className="px-3 pb-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">
                    {group.label}
                  </div>
                  <div className="space-y-0.5">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex min-h-11 items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                          linkActive(item.href)
                            ? "bg-accent/15 text-foreground font-medium"
                            : "text-muted-foreground hover:bg-accent/5 hover:text-foreground",
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        {item.href === "/drifts" && driftInboxCount > 0 && (
                          <span className="shrink-0 rounded-full bg-amber/15 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-amber">
                            {driftInboxCount > 99 ? "99+" : driftInboxCount}
                          </span>
                        )}
                        {item.premium && !isPro && (
                          <Sparkles className="h-3.5 w-3.5 shrink-0 text-accent" />
                        )}
                      </Link>
                    ))}
                  </div>
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
