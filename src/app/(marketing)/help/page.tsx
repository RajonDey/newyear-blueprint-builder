import type { Metadata } from "next"
import Link from "next/link"
import { Mail, MessageCircleQuestion } from "lucide-react"
import { OrnamentDivider } from "@/components/shared/ornament-divider"
import { CtaBand } from "@/components/marketing/sections/cta-band"
import { getSupportEmail } from "@/lib/legal"
import { SUPPORT_REPLY_SLA, buildSupportMailto } from "@/lib/support"

export const metadata: Metadata = {
  title: "Help & Support",
  description:
    "Get help with YearInReview — billing, exports, account questions, and how the app works.",
}

const quickLinks = [
  { href: "/faq", label: "FAQ", description: "Pricing, privacy, exports, and how the loop works." },
  { href: "/refund", label: "Refunds & cancellation", description: "30-day guarantee and how to cancel Pro." },
  { href: "/how-it-works", label: "How it works", description: "The weekly rhythm and planning model." },
  { href: "/pricing", label: "Pricing", description: "Free vs Pro — what's included." },
] as const

export default function HelpPage() {
  const supportEmail = getSupportEmail()
  const contactHref = buildSupportMailto({
    subject: "YearInReview support",
    body: [
      "Hi YearInReview team,",
      "",
      "What I need help with:",
      "",
      "Account email:",
      "Browser / device:",
      "",
      "Thanks!",
    ].join("\n"),
  })

  return (
    <>
      <section className="container pt-14 md:pt-20 pb-8 md:pb-12">
        <div className="max-w-2xl">
          <p className="font-display italic text-lg md:text-xl text-muted-foreground">
            We&apos;re here when you need us,
          </p>
          <h1 className="mt-6 font-display text-4xl md:text-5xl tracking-tight leading-[1.08] text-foreground">
            Help &amp; Support
          </h1>
          <p className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
            Questions about billing, your account, or how something works? Email us —
            we read every message and reply {SUPPORT_REPLY_SLA}.
          </p>
        </div>
      </section>

      <OrnamentDivider variant="asterisk" className="container max-w-2xl" />

      <section className="container py-12 md:py-16 max-w-2xl">
        <div className="border border-border bg-card p-6 md:p-8">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-amber">
            <Mail className="h-3.5 w-3.5" aria-hidden />
            Contact
          </div>
          <h2 className="mt-3 font-display text-2xl tracking-tight">Email support</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            The fastest way to reach us. Include your account email and a short description
            of what you were trying to do — screenshots help when something looks broken.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={contactHref}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90 transition-opacity"
            >
              <Mail className="h-4 w-4" aria-hidden />
              Email {supportEmail}
            </a>
            <p className="text-xs text-muted-foreground">
              Typical reply: {SUPPORT_REPLY_SLA}
            </p>
          </div>
        </div>

        <div className="mt-10">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <MessageCircleQuestion className="h-3.5 w-3.5" aria-hidden />
            Self-serve
          </div>
          <h2 className="mt-3 font-display text-xl tracking-tight">Common topics</h2>
          <ul className="mt-4 divide-y divide-border border border-border">
            {quickLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex flex-col gap-1 px-4 py-4 hover:bg-muted/30 transition-colors sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-xs text-muted-foreground sm:max-w-xs sm:text-right">
                    {item.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-10 text-sm text-muted-foreground leading-relaxed">
          Signed in? You can also open{" "}
          <Link href="/settings" className="text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground transition-colors">
            Settings
          </Link>{" "}
          to export your data, manage notifications, or update billing if you&apos;re on Pro.
        </p>
      </section>

      <CtaBand />
    </>
  )
}
