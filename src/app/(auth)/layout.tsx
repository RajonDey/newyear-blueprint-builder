import { MarketingLogoLink } from "@/components/marketing/marketing-logo-link"
import { AuthLetterVisual } from "@/components/auth/auth-letter-visual"

/* Hallmark · design-system: design.md · designed-as-app
 * Conversion shell — left-aligned Letter + Tier-A orbit art (§11).
 */

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="shrink-0 border-b border-border/70 bg-background">
        <div className="container flex h-16 items-center justify-between gap-4">
          <MarketingLogoLink />
        </div>
      </header>

      <main className="flex-1">
        <div className="container flex min-h-[calc(100dvh-4rem)] items-center py-10 md:py-14 lg:py-16">
          <div className="grid w-full items-center gap-12 md:grid-cols-2 md:gap-x-12 lg:gap-x-16 xl:gap-x-20">
            <div className="w-full max-w-md justify-self-start md:max-w-none">
              {children}
            </div>
            <AuthLetterVisual className="hidden md:flex" />
          </div>
        </div>
      </main>
    </div>
  )
}
