/**
 * Locked email brand tokens — mirrors design.md (editorial, warm ivory + ink + amber).
 * Email clients lack CSS variables; hex values are intentional duplicates of app tokens.
 */
export const emailColors = {
  /** warm ivory paper — --background */
  paper: "#f7f4ef",
  /** deep ink — --foreground */
  ink: "#1c2333",
  /** muted body — --muted-foreground */
  muted: "#5c6478",
  /** warm amber CTA — --accent */
  amber: "#e07833",
  /** hairline — --border */
  border: "#e8e2d9",
  /** wordmark / footer accent */
  sand: "#8b7355",
} as const

export const emailFonts = {
  /** Fraunces unavailable in most clients; Georgia preserves editorial tone */
  display: "Georgia, 'Times New Roman', serif",
  body: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
} as const

export const emailLayout = {
  maxWidth: "560px",
  radius: "10px",
} as const
