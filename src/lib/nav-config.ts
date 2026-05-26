import {
  LayoutDashboard,
  Target,
  CalendarCheck,
  CalendarDays,
  Activity,
  BarChart3,
  Gift,
  Ban,
  Compass,
  Layers,
  Sparkle,
  CheckSquare,
  Repeat,
  Inbox,
} from "lucide-react"

export type NavIcon = typeof LayoutDashboard

export type NavLink = {
  label: string
  href: string
  icon: NavIcon
  premium?: boolean
  adminOnly?: boolean
}

export type NavGroup = {
  id: string
  label: string
  items: NavLink[]
}

/** @see {@link ./app-routes.ts} */
export { DAILY_HOME_HREF } from "./app-routes"

/**
 * Single source of truth for the in-app navigation.
 *
 * Both `app-sidebar.tsx` and `mobile-nav.tsx` consume this — adding,
 * renaming, or reordering a route only requires editing this file.
 *
 * The IA is organised by *user intent*, not by data type:
 *   - **Today**     — surfaces you check daily (right-now state)
 *   - **Plan**      — the PARA work hierarchy (Areas → Projects → Tasks
 *                     → Systems). What you're moving on and the recurring
 *                     reps that drive it.
 *   - **Reflect**   — the rituals + the data that powers them
 *                     (Weekly · Monthly · Quarterly + Analytics)
 *   - **Foundation**— the compass surfaces set rarely and referred back
 *                     to (Wheel · Vision · Anti-goals · Wrapped)
 *
 * Account-level entries (Settings · Admin · Sign out) live in the
 * topbar avatar dropdown — *not* in the sidebar — matching the standard
 * Linear / Notion / Sunsama pattern.
 *
 * Routes deliberately *not* in the sidebar (still reachable, just not
 * top-level):
 *   - `/rhythm/daily` → legacy bookmark; redirects to `DAILY_HOME_HREF`.
 *     Today's checklist lives on the Dashboard `<TodayCard>`; manage at `/systems`.
 *   - `/settings`, `/admin` → topbar avatar dropdown.
 *
 * Both surfaces are still indexed by the Quick Capture palette's "Pages"
 * group, so keyboard-driven users can jump anywhere.
 */
export const navGroups: NavGroup[] = [
  {
    id: "today",
    label: "Today",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Drift inbox", href: "/drifts", icon: Inbox },
    ],
  },
  {
    id: "plan",
    label: "Plan",
    items: [
      { label: "Areas", href: "/areas", icon: Layers },
      { label: "Projects", href: "/projects", icon: Target },
      { label: "Tasks", href: "/tasks", icon: CheckSquare },
      { label: "Systems", href: "/systems", icon: Repeat },
    ],
  },
  {
    id: "reflect",
    label: "Reflect",
    items: [
      { label: "Weekly", href: "/rhythm/weekly", icon: CalendarCheck },
      { label: "Monthly", href: "/rhythm/monthly", icon: CalendarDays, premium: true },
      { label: "Quarterly", href: "/rhythm/quarterly", icon: Activity, premium: true },
      { label: "Analytics", href: "/analytics", icon: BarChart3, premium: true },
    ],
  },
  {
    id: "foundation",
    label: "Foundation",
    items: [
      { label: "Wheel of Life", href: "/wheel", icon: Compass },
      { label: "Vision", href: "/vision", icon: Sparkle },
      { label: "Anti-goals", href: "/anti-goals", icon: Ban },
      { label: "Year Wrapped", href: "/wrapped", icon: Gift },
    ],
  },
]

/**
 * Resolve which links a given role should see, dropping admin-only entries
 * for non-admins. Premium gating is purely a visual hint and is applied at
 * render time (not filtered here).
 *
 * `adminOnly` is currently unused in the sidebar (Admin lives in the
 * topbar avatar dropdown) but is kept on the type so we can flag future
 * admin-only routes without re-introducing the filter logic.
 */
export function getVisibleNavGroups(role: string): NavGroup[] {
  return navGroups.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.adminOnly || role === "ADMIN"),
  }))
}

/**
 * Best-effort route → human label lookup for the topbar breadcrumb.
 *
 * Handles both nav-config entries (via direct match / prefix match) and
 * the routes that intentionally don't appear in the sidebar (`/settings`,
 * `/admin`, `/rhythm/daily`, `/onboarding`, `/recap/*`).
 */
export function deriveRouteLabel(pathname: string): string {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (pathname === item.href) return item.label
      if (pathname.startsWith(item.href + "/")) return item.label
    }
  }
  if (pathname.startsWith("/recap/")) return "Recap"
  if (pathname.startsWith("/projects/")) return "Project"
  if (pathname.startsWith("/areas/")) return "Area"
  if (pathname.startsWith("/tasks")) return "Tasks"
  if (pathname.startsWith("/systems")) return "Systems"
  if (pathname.startsWith("/knowledge/notes") || pathname.startsWith("/notes"))
    return "Notes"
  if (pathname.startsWith("/knowledge/resources")) return "Resources"
  if (pathname.startsWith("/drifts")) return "Drift inbox"
  if (pathname.startsWith("/rhythm/daily")) return "Today"
  if (pathname.startsWith("/settings")) return "Settings"
  if (pathname.startsWith("/admin")) return "Admin"
  if (pathname.startsWith("/onboarding")) return "Welcome"
  return "Dashboard"
}

/**
 * Compute the calendar quarter (1-4) a given date falls into.
 * Used by the topbar week/quarter chip.
 */
export function getQuarterLabel(date: Date = new Date()): "Q1" | "Q2" | "Q3" | "Q4" {
  const m = date.getMonth() // 0-11
  if (m <= 2) return "Q1"
  if (m <= 5) return "Q2"
  if (m <= 8) return "Q3"
  return "Q4"
}
