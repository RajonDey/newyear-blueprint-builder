/**
 * Client-safe HTML coercion for pre-sanitized content.
 *
 * All rich text is sanitized at the API write boundary (src/lib/sanitize.ts)
 * before storage. This function handles null/undefined coercion so client
 * components can safely pass values to dangerouslySetInnerHTML without
 * importing the Node.js-only `sanitize-html` package.
 */
export function sanitizeRichTextHtml(input: string | null | undefined): string {
  return input?.trim() || ""
}
