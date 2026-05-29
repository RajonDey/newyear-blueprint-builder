import type { Metadata } from "next"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import { BookOpen, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OrnamentDivider } from "@/components/shared/ornament-divider"
import { MandalaWatermark } from "@/components/shared/mandala-watermark"
import { JsonLdScript } from "@/components/seo/json-ld-script"
import { buildBlogIndexJsonLd } from "@/lib/seo/json-ld"
import { getAllWisdomMeta } from "@/lib/wisdom"

export const metadata: Metadata = {
  title: "Wisdom",
  description:
    "Essays on annual planning, weekly rhythm, systems, and anti-goals—aligned with how YearInReview works.",
}

function formatDate(iso: string) {
  try {
    return format(parseISO(iso), "MMM d, yyyy")
  } catch {
    return iso
  }
}

export default function BlogPage() {
  const posts = getAllWisdomMeta()

  return (
    <div className="relative overflow-hidden">
      <JsonLdScript data={buildBlogIndexJsonLd(posts)} />
      <MandalaWatermark size="md" position="top-right" className="opacity-[0.035]" />
      <div className="container py-16 md:py-24 max-w-3xl relative z-10">
        <header className="text-center max-w-2xl mx-auto mb-14 md:mb-16">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
            <BookOpen className="h-7 w-7" />
          </div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent mb-3">Wisdom</p>
          <h1 className="text-4xl md:text-5xl font-display font-semibold text-foreground mb-4">
            Ideas for a year that lasts
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Practical essays on planning, rhythm, and boundaries—written to pair with the product, not
            replace it.
          </p>
        </header>

        <OrnamentDivider variant="dot" className="max-w-xs mx-auto mb-12" />

        <ul className="space-y-5">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group block rounded-xl border border-border/80 bg-card/60 hover:bg-card hover:border-accent/25 transition-colors p-6 md:p-7 bg-lotus-corner"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-2">
                  <h2 className="text-xl md:text-2xl font-display font-semibold text-foreground group-hover:text-primary transition-colors pr-4">
                    {post.title}
                  </h2>
                  <time
                    dateTime={post.date}
                    className="text-sm text-muted-foreground shrink-0 tabular-nums"
                  >
                    {formatDate(post.date)}
                  </time>
                </div>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base mb-4">
                  {post.description}
                </p>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  Read article
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-14 pt-12 border-t border-border/80 text-center space-y-5">
          <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto">
            New pieces ship here first. The best next step is still to build your plan inside the app.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild className="font-display font-semibold tracking-wide">
              <Link href="/signup">Begin free</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/how-it-works">See how it works</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
