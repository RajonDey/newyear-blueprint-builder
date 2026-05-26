"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  CreditCard,
  LogOut,
  Moon,
  Settings as SettingsIcon,
  Shield,
  Sun,
  User as UserIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MobileNav } from "@/components/shared/mobile-nav"
import { QuickCaptureButton, GlobalSearchTrigger } from "@/components/shared/quick-capture-button"
import { ProMark } from "@/components/atmosphere/pro-mark"
import { deriveRouteLabel } from "@/lib/nav-config"
import { hasProProductAccess } from "@/lib/plan-access"
import type { PlanTier, Role } from "@prisma/client"

interface TopbarProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    planTier: PlanTier
    role: Role
  }
  weekContext?: {
    weekNumber: number
    quarter: "Q1" | "Q2" | "Q3" | "Q4"
  }
  driftInboxCount?: number
}

export function Topbar({ user, weekContext, driftInboxCount = 0 }: TopbarProps) {
  const { setTheme, theme } = useTheme()
  const pathname = usePathname()
  const pageLabel = deriveRouteLabel(pathname)
  const isPro = hasProProductAccess(user.planTier, user.role)
  const isAdmin = user.role === "ADMIN"
  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border/60 bg-background/70 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6">
      <div className="md:hidden">
        <MobileNav
          planTier={user.planTier}
          role={user.role}
          driftInboxCount={driftInboxCount}
        />
      </div>

      <div className="hidden md:flex items-baseline gap-2 text-sm">
        <span className="font-display tracking-tight text-foreground">
          {pageLabel}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-3 sm:gap-4">
        <GlobalSearchTrigger />
        <QuickCaptureButton />

        {weekContext && (
          <span className="hidden sm:inline text-xs text-muted-foreground tabular-nums">
            Week {weekContext.weekNumber}
            <span className="mx-1.5 opacity-40">·</span>
            {weekContext.quarter}
          </span>
        )}

        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.image || undefined} alt={user.name || ""} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              {isPro && (
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-background text-[10px] leading-none">
                  <ProMark />
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="text-sm font-medium">{user.name || "Account"}</div>
              <div className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                {isPro ? (
                  <>
                    Pro plan <ProMark className="text-[11px]" />
                  </>
                ) : (
                  "Free plan"
                )}
              </div>
              {user.email && (
                <div className="text-[11px] text-muted-foreground/80 mt-0.5 truncate">
                  {user.email}
                </div>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <SettingsIcon className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            {!isPro ? (
              <DropdownMenuItem asChild>
                <Link href="/settings#billing" className="cursor-pointer">
                  <UserIcon className="mr-2 h-4 w-4" />
                  Upgrade to Pro
                </Link>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem asChild>
                <Link href="/settings#billing" className="cursor-pointer">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Manage plan
                </Link>
              </DropdownMenuItem>
            )}
            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="cursor-pointer">
                    <Shield className="mr-2 h-4 w-4" />
                    Admin
                  </Link>
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
