"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

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
          <div className="absolute inset-y-0 right-0 w-72 border-l bg-background p-6 shadow-lg">
            <div className="flex items-center justify-between mb-8">
              <span className="font-display text-lg font-semibold">Menu</span>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex flex-col gap-1">
              <Link
                href="/features"
                className="rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/blog"
                className="rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                Wisdom
              </Link>
              <p className="mt-6 mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Legal
              </p>
              <Link
                href="/terms"
                className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                Terms of Service
              </Link>
              <Link
                href="/privacy"
                className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                Privacy Policy
              </Link>
              <Link
                href="/cookies"
                className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                Cookie Policy
              </Link>
              <Link
                href="/privacy/california"
                className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                California privacy
              </Link>
              <Link
                href="/refund"
                className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                Refund Policy
              </Link>
              <div className="my-4 h-px bg-border" />
              <Button variant="outline" className="w-full h-11 font-medium border-border/90" asChild>
                <Link href="/login" onClick={() => setOpen(false)}>
                  Log in
                </Link>
              </Button>
              <Button
                className="w-full h-11 mt-3 font-display font-semibold tracking-wide shadow-sm"
                asChild
              >
                <Link href="/signup" onClick={() => setOpen(false)}>
                  Begin your journey
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
