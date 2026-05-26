import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MarketingMobileNav } from "@/components/shared/marketing-mobile-nav"
import { MarketingLogoLink } from "@/components/marketing/marketing-logo-link"
import { cn } from "@/lib/utils"

const navLinkClass =
  "text-sm text-muted-foreground transition-colors hover:text-foreground"

const footerLinkClass =
  "text-sm text-muted-foreground/90 transition-colors hover:text-foreground"

const primaryNav = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
] as const

const footerExploreNav = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Wisdom" },
] as const

const footerLegalNav = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/cookies", label: "Cookies" },
  { href: "/privacy/california", label: "California" },
  { href: "/refund", label: "Refunds" },
] as const

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/70 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between gap-4">
          <MarketingLogoLink />

          <nav
            className="hidden md:flex items-center gap-8"
            aria-label="Primary"
          >
            {primaryNav.map((item) => (
              <Link key={item.href} href={item.href} className={navLinkClass}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/login" className={cn(navLinkClass, "hidden sm:inline-flex px-3 py-1.5")}>
              Sign in
            </Link>
            <Button size="sm" asChild>
              <Link href="/signup">Begin your year</Link>
            </Button>
            <MarketingMobileNav />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/60 mt-20">
        <div className="container py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <Link
              href="/"
              className="inline-flex items-baseline gap-2 group"
              aria-label="YearInReview home"
            >
              <span className="text-amber leading-none">✦</span>
              <span className="font-display text-lg tracking-tight text-foreground transition-colors group-hover:text-foreground/80">
                YearInReview
              </span>
            </Link>

            <nav
              aria-label="Footer primary"
              className="flex items-center gap-x-6 gap-y-2 flex-wrap md:justify-end"
            >
              {footerExploreNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={footerLinkClass}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="mt-6 pt-6 border-t border-border/40 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-muted-foreground/80">
            <span>
              &copy; {new Date().getFullYear()} YearInReview · Calm by design
            </span>
            <nav
              aria-label="Footer legal"
              className="flex items-center gap-x-5 gap-y-2 flex-wrap md:justify-end"
            >
              {footerLegalNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
