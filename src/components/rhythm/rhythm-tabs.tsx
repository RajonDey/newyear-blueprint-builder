"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const tabs = [
  { name: "Daily Systems", href: "/rhythm/daily" },
  { name: "Weekly Rhythm", href: "/rhythm/weekly" },
  { name: "Monthly Review", href: "/rhythm/monthly" },
  { name: "Quarterly Milestones", href: "/rhythm/quarterly" },
]

export function RhythmTabs() {
  const pathname = usePathname()

  return (
    <div className="border-b bg-background sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <nav className="-mb-px flex gap-6 overflow-x-auto no-scrollbar" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/")
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors",
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                )}
              >
                {tab.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
