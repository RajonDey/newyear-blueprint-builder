import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { compileMDX } from "next-mdx-remote/rsc"
import { format, parseISO } from "date-fns"
import matter from "gray-matter"
import { ArrowLeft } from "lucide-react"
import { MandalaWatermark } from "@/components/shared/mandala-watermark"
import { OrnamentDivider } from "@/components/shared/ornament-divider"
import { JsonLdScript } from "@/components/seo/json-ld-script"
import { wisdomMdxComponents } from "@/components/wisdom/wisdom-mdx-components"
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/seo/json-ld"
import { getSiteUrl } from "@/lib/seo/site"
import {
  estimateReadingMinutes,
  getWisdomLastModified,
  getWisdomSlugs,
  getWisdomSourceBySlug,
  type WisdomFrontmatter,
} from "@/lib/wisdom"

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return getWisdomSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const raw = getWisdomSourceBySlug(slug)
  if (!raw) return { title: "Article" }
  const { data } = matter(raw)
  const fm = data as WisdomFrontmatter
  const url = getSiteUrl(`/blog/${slug}`)

  return {
    title: fm.title,
    description: fm.description,
    keywords: fm.keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${fm.title} | YearInReview Wisdom`,
      description: fm.description,
      type: "article",
      publishedTime: fm.date,
      modifiedTime: getWisdomLastModified(fm),
      url,
    },
  }
}

export default async function WisdomArticlePage({ params }: Props) {
  const { slug } = await params
  const raw = getWisdomSourceBySlug(slug)
  if (!raw) notFound()

  const parsed = matter(raw)
  const minutes = estimateReadingMinutes(parsed.content)

  const { content, frontmatter } = await compileMDX<WisdomFrontmatter>({
    source: raw,
    options: { parseFrontmatter: true },
    components: wisdomMdxComponents,
  })

  const fm = frontmatter
  const dateLabel = (() => {
    try {
      return format(parseISO(fm.date), "MMMM d, yyyy")
    } catch {
      return fm.date
    }
  })()

  return (
    <div className="relative overflow-hidden">
      <JsonLdScript
        data={[
          buildArticleJsonLd({
            ...fm,
            slug,
            readingMinutes: minutes,
          }),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Wisdom", path: "/blog" },
            { name: fm.title, path: `/blog/${slug}` },
          ]),
        ]}
      />
      <MandalaWatermark size="lg" position="top-right" className="opacity-[0.04]" />
      <article className="container max-w-3xl py-12 md:py-16 relative z-10">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-10"
        >
          <ArrowLeft className="h-4 w-4" />
          Wisdom
        </Link>

        <header className="mb-10 space-y-4">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Wisdom</p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-[2.5rem] font-semibold tracking-tight text-foreground leading-tight">
            {fm.title}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">{fm.description}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <time dateTime={fm.date}>{dateLabel}</time>
            <span aria-hidden>·</span>
            <span>{minutes} min read</span>
          </div>
        </header>

        <OrnamentDivider variant="lotus" className="mb-12 max-w-xs" />

        <div
          className="prose prose-neutral dark:prose-invert max-w-none prose-lg
          prose-headings:font-display prose-headings:font-semibold prose-headings:tracking-tight
          prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
          prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
          prose-p:leading-relaxed prose-li:leading-relaxed
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          prose-strong:text-foreground prose-strong:font-semibold"
        >
          {content}
        </div>
      </article>
    </div>
  )
}
