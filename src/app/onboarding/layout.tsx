import { MarketingLogoLink } from "@/components/marketing/marketing-logo-link"
import { requireAuth } from "@/lib/auth-guard"

/* Hallmark · design-system: design.md · designed-as-app
 * Onboarding shell — conversion Letter family (§2, §11).
 */

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth()

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="shrink-0 border-b border-border/70 bg-background">
        <div className="container flex h-16 items-center">
          <MarketingLogoLink />
        </div>
      </header>
      <main className="container flex-1 py-10 md:py-14">{children}</main>
    </div>
  )
}
