import Link from "next/link"
import { Button } from "@/components/ui/button"
import { OrnamentDivider } from "@/components/shared/ornament-divider"
import { MarketingMobileNav } from "@/components/shared/marketing-mobile-nav"
import { MarketingLogoLink } from "@/components/marketing/marketing-logo-link"
import { cn } from "@/lib/utils"

const navLinkClass =
  "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
        <div className="container flex h-16 items-center justify-between gap-4">
          <MarketingLogoLink />

          <div className="flex flex-1 items-center justify-end gap-0 min-w-0">
            <nav className="hidden md:flex items-center gap-x-7" aria-label="Primary">
              <Link href="/features" className={navLinkClass}>
                Features
              </Link>
              <Link href="/pricing" className={navLinkClass}>
                Pricing
              </Link>
              <Link href="/blog" className={navLinkClass}>
                Wisdom
              </Link>
            </nav>

            <div
              className={cn(
                "hidden md:flex items-center gap-3 pl-7 ml-5 border-l border-border/70 shrink-0"
              )}
            >
              <Link href="/login" className={navLinkClass}>
                Log in
              </Link>
              <Button
                size="default"
                className="h-9 px-5 font-display font-semibold tracking-wide shadow-sm"
                asChild
              >
                <Link href="/signup">Begin your journey</Link>
              </Button>
            </div>

            <MarketingMobileNav />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="">
        <div className="container py-12">
          <OrnamentDivider variant="lotus" className="pb-8 pt-0" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="font-display text-lg text-foreground">YearInReview</span>
              <span className="text-sm text-muted-foreground">— Design a life worth living</span>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 md:justify-end">
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cookies
              </Link>
              <Link
                href="/privacy/california"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                California
              </Link>
              <Link href="/refund" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Refunds
              </Link>
            </nav>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-8">
            &copy; {new Date().getFullYear()} YearInReview. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
