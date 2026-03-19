import Link from "next/link"
import { Button } from "@/components/ui/button"
import { OrnamentDivider } from "@/components/shared/ornament-divider"

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <svg
              viewBox="0 0 28 28"
              fill="none"
              className="h-7 w-7 text-primary"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="14"
                cy="14"
                r="12"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle
                cx="14"
                cy="14"
                r="7"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.6"
              />
              <circle cx="14" cy="14" r="2.5" fill="currentColor" opacity="0.4" />
              <line x1="14" y1="2" x2="14" y2="26" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
              <line x1="2" y1="14" x2="26" y2="14" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
            </svg>
            <span className="text-xl font-display font-semibold tracking-wide text-foreground">
              YearInReview
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/pricing"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/blog"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Wisdom
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Begin Your Journey</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t">
        <div className="container py-12">
          <OrnamentDivider variant="lotus" className="pb-8 pt-0" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="font-display text-lg text-foreground">
                YearInReview
              </span>
              <span className="text-sm text-muted-foreground">
                — Design a life worth living
              </span>
            </div>
            <nav className="flex items-center gap-6">
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/refund"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Refund
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
