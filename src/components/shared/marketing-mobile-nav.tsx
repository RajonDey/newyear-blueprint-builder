"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BrandMark } from "@/components/shared/brand-mark"

const primaryNav = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
] as const

const legalNav = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/cookies", label: "Cookie Policy" },
  { href: "/privacy/california", label: "California privacy" },
  { href: "/refund", label: "Refund Policy" },
  { href: "/blog", label: "Wisdom" },
] as const

export function MarketingMobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
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
          <div className="absolute inset-y-0 right-0 w-72 border-l bg-background p-6 shadow-lg overflow-y-auto">
            <div className="mb-8 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 font-display text-lg tracking-tight leading-none">
                <BrandMark size="md" />
                YearInReview
              </span>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="flex flex-col gap-1">
              {primaryNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <p className="mt-6 mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/80">
                More
              </p>
              {legalNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <div className="my-5 h-px bg-border" />

              <Button variant="outline" className="w-full h-11" asChild>
                <Link href="/login" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
              </Button>
              <Button className="w-full h-11 mt-3" asChild>
                <Link href="/signup" onClick={() => setOpen(false)}>
                  Begin your year
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
