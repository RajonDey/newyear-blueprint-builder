import type { Metadata } from "next"
import Link from "next/link"
import { CtaBand } from "@/components/marketing/sections/cta-band"
import { FaqAccordion } from "@/components/marketing/faq-accordion"

/* Hallmark · design-system: design.md · designed-as-app
 * FAQ — Letter lede + conversational Q&A (Wave E).
 */

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about pricing, privacy, exports, and how YearInReview fits into your year.",
}

const FAQS = [
  {
    q: "Is my data private?",
    a: "Yes. Your reflections, plans, and check-ins are yours. We never sell data. Download a full JSON export anytime from Settings.",
  },
  {
    q: "Can I export my year?",
    a: "Yes. Free and Pro both include a full JSON export from Settings — your plans, projects, reflections, notes, and rhythm history in one file. Pro also adds the beautifully laid-out Year Wrapped you can share or save.",
  },
  {
    q: "Will Free always be free?",
    a: "Yes. Free is the whole loop, kept simple — and it stays free forever. Pro exists for people who want depth, deeper reviews, and proof at year-end.",
  },
  {
    q: "What if I miss a week?",
    a: "Nothing breaks. No streak shame, no red marks. YearInReview is built around returning, not punishing absence.",
  },
  {
    q: "Do I have to be a 'productive' person?",
    a: "No. This is a reflection system, not a productivity tool. If you want a calmer relationship with your goals, you're the right reader.",
  },
  {
    q: "How is this different from Notion or a planner?",
    a: "Notion is a blank canvas — powerful, but heavy. Planners are static. YearInReview is a guided yearly practice with a single loop and calm UX. You don't build the system; the system holds you.",
  },
  {
    q: "What's the difference between Free and Pro?",
    a: "Free gives you the full planning loop — up to 3 projects, the weekly rhythm, and a year-end summary. Pro unlocks up to 20 projects, 50 anti-goals, monthly and quarterly reviews, advanced analytics, and the full Year Wrapped.",
  },
  {
    q: "Refund policy?",
    a: "Cancel any time. We don't issue partial refunds, but you'll keep Pro access through the end of your billing period and your data stays yours. See our refund page for details.",
  },
  {
    q: "Can I use this with a team?",
    a: "YearInReview is built for individuals. Personal reflection works best when private. Teams aren't on the roadmap — by design.",
  },
  {
    q: "Will my data carry into next year?",
    a: "Yes. Each year gets its own plan, and your history is preserved so you can see how you've grown across years.",
  },
]

export default function FaqPage() {
  return (
    <>
      <section className="container pt-14 md:pt-20 pb-10 md:pb-14">
        <div className="max-w-xl">
          <p className="font-display italic text-lg md:text-xl text-muted-foreground">
            Questions we hear often,
          </p>
          <h1 className="mt-6 font-display text-4xl md:text-5xl tracking-tight leading-[1.08] text-foreground">
            The honest answers.
          </h1>
          <p className="mt-6 text-base md:text-lg text-muted-foreground leading-relaxed">
            Still stuck?{" "}
            <Link
              href="/pricing"
              className="text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground transition-colors"
            >
              See pricing
            </Link>{" "}
            or read the{" "}
            <Link
              href="/refund"
              className="text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground transition-colors"
            >
              refund policy
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="container pb-14 md:pb-20">
        <FaqAccordion items={FAQS} />
      </section>

      <CtaBand />
    </>
  )
}
