import type { Metadata } from "next"
import { Inter, Cormorant_Garamond, JetBrains_Mono } from "next/font/google"
import { ThemeProvider } from "next-themes"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
})

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: {
    default: "YearInReview — Design a Life Worth Living",
    template: "%s | YearInReview",
  },
  description:
    "A mindful annual planning platform — reflect on your journey, set intentional goals, and walk your path with clarity all year long.",
  keywords: [
    "year planning",
    "annual goals",
    "mindful planning",
    "life design",
    "wheel of life",
    "intentional living",
    "personal growth",
    "annual review",
  ],
  authors: [{ name: "YearInReview" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://yearinreview.online",
    siteName: "YearInReview",
    title: "YearInReview — Design a Life Worth Living",
    description:
      "A mindful annual planning platform. Reflect. Plan. Walk your path with clarity.",
  },
  twitter: {
    card: "summary_large_image",
    title: "YearInReview — Design a Life Worth Living",
    description:
      "Reflect on your journey. Set intentional goals. Walk your path all year long.",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${cormorant.variable} ${mono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
