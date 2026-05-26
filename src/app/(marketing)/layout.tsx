import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BrandMark } from "@/components/shared/brand-mark"
import { MarketingLogoLink } from "@/components/marketing/marketing-logo-link"
import { MarketingMobileNav } from "@/components/shared/marketing-mobile-nav"

/* Hallmark · design-system: design.md · designed-as-app
 * Marketing shell — balanced sticky nav + letter close footer.
 *
 * Replaced the N6 newspaper masthead (centred logo + split sign-in/nav/CTA
 * rows) with a single aligned row: wordmark left, nav centre, actions right.
 */

const primaryNav = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "Letters" },
  { href: "/about", label: "About" },
] as const

const legalNav = [
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
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
        <div className="container flex h-16 items-center gap-6 md:h-[4.25rem]">
          <MarketingLogoLink className="shrink-0" />

          <nav
            aria-label="Primary"
            className="hidden flex-1 items-center justify-center gap-x-8 md:flex"
          >
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3 md:gap-4">
            <Link
              href="/login"
              className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
            >
              Sign in
            </Link>
            <Button size="sm" className="hidden sm:inline-flex" asChild>
              <Link href="/signup">Begin your year</Link>
            </Button>
            <MarketingMobileNav />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-24 md:mt-32 border-t border-border/60 bg-secondary/30">
        <div className="container py-14 md:py-20">
          <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
            <div className="max-w-xl">
              <p className="font-display italic text-xl md:text-2xl leading-snug text-foreground">
                Yours,
                <br />
                <span className="not-italic font-semibold tracking-tight">
                  — the YearInReview team
                </span>
              </p>
              <p className="mt-5 text-sm md:text-base text-muted-foreground leading-relaxed">
                P.S. — if you{"\u2019"}re reading this and the year feels heavier
                than it should,{" "}
                <Link
                  href="/signup"
                  className="text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground transition-colors"
                >
                  start a plan
                </Link>
                . The first one is free, and it takes about ninety seconds.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground/80">
                <span>&copy; {new Date().getFullYear()} YearInReview</span>
                {legalNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/blog"
                  className="hover:text-foreground transition-colors"
                >
                  Wisdom
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex flex-col items-center gap-3 opacity-80">
              <BrandMark size="xl" />
              <p className="font-display text-sm text-muted-foreground italic">
                One year. One system.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
