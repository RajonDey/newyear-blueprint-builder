import type { FaqItem } from "@/lib/marketing/faq-content"
import type { WisdomFrontmatter } from "@/lib/wisdom"
import { getWisdomLastModified } from "@/lib/wisdom"
import {
  ORGANIZATION,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  getSiteUrl,
} from "@/lib/seo/site"

type JsonLdObject = Record<string, unknown>

const SCHEMA_CONTEXT = "https://schema.org"

function organizationRef(): JsonLdObject {
  return {
    "@type": "Organization",
    name: ORGANIZATION.name,
    url: ORGANIZATION.url,
    logo: {
      "@type": "ImageObject",
      url: ORGANIZATION.logoUrl,
    },
    email: ORGANIZATION.email,
  }
}

export function buildWebSiteJsonLd(): JsonLdObject {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: SITE_TAGLINE,
    url: getSiteUrl(),
    description: SITE_DESCRIPTION,
    publisher: organizationRef(),
  }
}

export function buildSoftwareApplicationJsonLd(): JsonLdObject {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web",
    url: getSiteUrl(),
    description: SITE_DESCRIPTION,
    offers: [
      {
        "@type": "Offer",
        name: "Free",
        price: "0",
        priceCurrency: "USD",
        url: getSiteUrl("/pricing"),
      },
      {
        "@type": "Offer",
        name: "Pro",
        priceCurrency: "USD",
        url: getSiteUrl("/pricing"),
      },
    ],
    publisher: organizationRef(),
  }
}

export function buildFaqPageJsonLd(faqs: FaqItem[]): JsonLdObject {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  }
}

type ArticleJsonLdInput = WisdomFrontmatter & {
  slug: string
  readingMinutes: number
}

export function buildArticleJsonLd(input: ArticleJsonLdInput): JsonLdObject {
  const url = getSiteUrl(`/blog/${input.slug}`)
  const dateModified = getWisdomLastModified(input)
  const keywords = input.keywords?.length ? input.keywords.join(", ") : undefined

  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "Article",
    headline: input.title,
    description: input.description,
    datePublished: input.date,
    dateModified,
    author: organizationRef(),
    publisher: organizationRef(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    url,
    ...(keywords ? { keywords } : {}),
    timeRequired: `PT${input.readingMinutes}M`,
    articleSection: input.pillar,
    isPartOf: {
      "@type": "Blog",
      name: "YearInReview Wisdom",
      url: getSiteUrl("/blog"),
    },
  }
}

type BlogListItem = WisdomFrontmatter & { slug: string }

export function buildBlogIndexJsonLd(posts: BlogListItem[]): JsonLdObject {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "Blog",
    name: "YearInReview Wisdom",
    description:
      "Essays on annual planning, weekly rhythm, systems, and anti-goals — aligned with how YearInReview works.",
    url: getSiteUrl("/blog"),
    publisher: organizationRef(),
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: getWisdomLastModified(post),
      url: getSiteUrl(`/blog/${post.slug}`),
    })),
  }
}

export function buildBreadcrumbJsonLd(
  items: { name: string; path: string }[],
): JsonLdObject {
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: getSiteUrl(item.path),
    })),
  }
}
