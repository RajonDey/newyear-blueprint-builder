import sanitizeHtml from "sanitize-html"

const BASE_ALLOWED_TAGS = sanitizeHtml.defaults.allowedTags ?? []
const ALLOWED_TAGS = Array.from(
  new Set([
    ...BASE_ALLOWED_TAGS,
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
  ])
)

export function sanitizeRichTextHtml(input: string | null | undefined): string {
  if (!input) return ""
  return sanitizeHtml(input, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "target", "rel"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer nofollow",
        target: "_blank",
      }),
    },
  }).trim()
}
