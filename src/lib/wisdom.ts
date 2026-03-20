import fs from "fs"
import path from "path"
import matter from "gray-matter"

export const WISDOM_DIR = path.join(process.cwd(), "content/wisdom")

export type WisdomFrontmatter = {
  title: string
  description: string
  /** ISO date string YYYY-MM-DD */
  date: string
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

export function estimateReadingMinutes(mdxBody: string): number {
  const words = mdxBody.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}
