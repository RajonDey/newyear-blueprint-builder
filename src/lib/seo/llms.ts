import { MARKETING_FAQS } from "@/lib/marketing/faq-content"
import { getAllWisdomMeta } from "@/lib/wisdom"
import { SITE_DESCRIPTION, SITE_NAME, getSiteUrl } from "@/lib/seo/site"

const MARKETING_PAGES = [
  { path: "/", label: "Home" },
  { path: "/how-it-works", label: "How it works" },
  { path: "/pricing", label: "Pricing" },
  { path: "/faq", label: "FAQ" },
  { path: "/about", label: "About" },
  { path: "/help", label: "Help & support" },
  { path: "/blog", label: "Wisdom (blog)" },
  { path: "/signup", label: "Sign up" },
] as const

export function buildLlmsTxt(): string {
  const posts = getAllWisdomMeta()
  const lines: string[] = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    "## About",
    "",
    `${SITE_NAME} is a web app for calm annual planning: yearly vision, wheel of life, weekly rhythm,`,
    "monthly and quarterly reviews, anti-goals, projects, and a year-end wrapped summary.",
    "It is built for individuals who want intentional planning without hustle-culture productivity.",
    "",
    "## Primary pages",
    "",
    ...MARKETING_PAGES.map(
      (page) => `- ${page.label}: ${getSiteUrl(page.path)}`,
    ),
    "",
    "## Wisdom (blog)",
    "",
  ]

  if (posts.length === 0) {
    lines.push("- (No articles published yet.)")
  } else {
    for (const post of posts) {
      lines.push(
        `- ${post.title}: ${getSiteUrl(`/blog/${post.slug}`)}`,
      )
    }
  }

  lines.push(
    "",
    "## Common questions",
    "",
    ...MARKETING_FAQS.slice(0, 6).map((faq) => `- **${faq.q}** ${faq.a}`),
    "",
    "## Optional",
    "",
    `- Sitemap: ${getSiteUrl("/sitemap.xml")}`,
    `- Robots: ${getSiteUrl("/robots.txt")}`,
    "",
  )

  return lines.join("\n")
}
