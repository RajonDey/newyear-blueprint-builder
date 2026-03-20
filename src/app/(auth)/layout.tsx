import { MarketingLogoLink } from "@/components/marketing/marketing-logo-link"
import { MandalaWatermark } from "@/components/shared/mandala-watermark"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <MandalaWatermark
          size="lg"
          position="center"
          className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.055] text-primary"
        />
      </div>

      <header className="relative z-10 shrink-0 border-b border-border/80 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
        <div className="container flex h-16 items-center">
          <MarketingLogoLink />
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-[420px]">{children}</div>
      </main>
    </div>
  )
}
