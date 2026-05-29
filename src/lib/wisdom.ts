import fs from "fs"
import path from "path"
import matter from "gray-matter"

export const WISDOM_DIR = path.join(process.cwd(), "content/wisdom")

export const WISDOM_PILLARS = [
  "annual-planning",
  "weekly-rhythm",
  "wheel-of-life",
  "anti-goals",
  "systems",
] as const

export type WisdomPillar = (typeof WISDOM_PILLARS)[number]

export type WisdomFrontmatter = {
  title: string
  description: string
  /** ISO date string YYYY-MM-DD */
  date: string
  /** ISO date string YYYY-MM-DD — defaults to `date` when omitted */
  updated?: string
  /** Target SEO keywords for the article */
  keywords?: string[]
  /** Content cluster for internal linking and schema */
  pillar?: WisdomPillar
}

export function getWisdomSlugs(): string[] {
  if (!fs.existsSync(WISDOM_DIR)) return []
  return fs
    .readdirSync(WISDOM_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""))
}

export function getAllWisdomMeta(): (WisdomFrontmatter & { slug: string })[] {
  return getWisdomSlugs()
    .map((slug) => {
      const raw = fs.readFileSync(path.join(WISDOM_DIR, `${slug}.mdx`), "utf8")
      const { data } = matter(raw)
      return { slug, ...(data as WisdomFrontmatter) }
    })
    .filter((p) => p.title && p.description && p.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getWisdomSourceBySlug(slug: string): string | null {
  const file = path.join(WISDOM_DIR, `${slug}.mdx`)
  if (!fs.existsSync(file)) return null
  return fs.readFileSync(file, "utf8")
}

export function getWisdomLastModified(
  post: Pick<WisdomFrontmatter, "date" | "updated">,
): string {
  return post.updated ?? post.date
}

export function getLatestWisdomModifiedDate(): Date | null {
  const posts = getAllWisdomMeta()
  if (posts.length === 0) return null

  let latest = new Date(0)
  for (const post of posts) {
    const modified = new Date(getWisdomLastModified(post))
    if (!Number.isNaN(modified.getTime()) && modified > latest) {
      latest = modified
    }
  }

  return latest.getTime() === 0 ? null : latest
}

export function estimateReadingMinutes(mdxBody: string): number {
  const words = mdxBody.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

export function parseWisdomDate(iso: string): Date | null {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? null : date
}
