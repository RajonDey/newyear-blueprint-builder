"use client"

import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import { Moon, Sun, LogOut, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { MobileNav } from "@/components/shared/mobile-nav"
import type { PlanTier, Role } from "@prisma/client"

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/goals": "Goals",
  "/rhythm/daily": "Daily Habits",
  "/rhythm/weekly": "Weekly Planner",
  "/rhythm/monthly": "Monthly Review",
  "/rhythm/quarterly": "Quarterly Review",
  "/analytics": "Analytics",
  "/wrapped": "Year Wrapped",
  "/settings": "Settings",
  "/admin": "Admin",
}

function getPageTitle(pathname: string): string | null {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  if (pathname.startsWith("/goals/")) return "Goal Detail"
  if (pathname.startsWith("/plan/new")) return "Plan Wizard"
  if (pathname.startsWith("/plan/")) return "Your Plan"
  return null
}

interface TopbarProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    planTier: PlanTier
    role: Role
  }
}

export function Topbar({ user }: TopbarProps) {
  const { setTheme, theme } = useTheme()
  const pathname = usePathname()
  const pageTitle = getPageTitle(pathname)
  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U"

  return (
    <header className="flex h-16 items-center justify-between border-b px-4 sm:px-6">
      <div className="md:hidden">
        <MobileNav planTier={user.planTier} role={user.role} />
      </div>
      {pageTitle && (
        <p className="hidden md:block text-sm font-medium text-muted-foreground">
          {pageTitle}
        </p>
      )}
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.image || undefined} alt={user.name || ""} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center gap-2 p-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <UserIcon className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
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
