"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ListChecks, CalendarCheck, CalendarDays, Activity } from "lucide-react"

const tabs = [
  { name: "Daily", href: "/rhythm/daily", icon: ListChecks },
  { name: "Weekly", href: "/rhythm/weekly", icon: CalendarCheck },
  { name: "Monthly", href: "/rhythm/monthly", icon: CalendarDays },
  { name: "Quarterly", href: "/rhythm/quarterly", icon: Activity },
]

export function RhythmTabs() {
  const pathname = usePathname()

  return (
    <div className="border-b bg-background sticky top-0 z-20 px-4 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <nav className="-mb-px flex gap-1" aria-label="Rhythm cadence">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/")
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap border-b-2 py-3 px-3 text-sm font-medium transition-colors",
                  isActive
                    ? "border-accent text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className={cn("h-4 w-4", isActive && "text-accent")} />
                {tab.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
