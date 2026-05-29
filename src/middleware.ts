import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

/**
 * Edge middleware must stay small (< 1 MB on Vercel Hobby). Do not import `@/lib/auth`
 * here — it pulls Prisma, adapters, and providers into the Edge bundle.
 * Session is validated via JWT only (`getToken`). API routes still use `auth()` in Node.
 */
const publicRoutes = [
  "/",
  "/login",
  "/signup",
  "/pricing",
  "/features",
  "/how-it-works",
  "/about",
  "/faq",
  "/help",
  "/blog",
  "/terms",
  "/privacy",
  "/refund",
  "/cookies",
]

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const isApiRoute = pathname.startsWith("/api")
  const isStaticAsset =
    pathname.startsWith("/_next") || pathname.includes(".")

  if (isApiRoute || isStaticAsset) {
    return NextResponse.next()
  }

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )

  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    console.error("[middleware] NEXTAUTH_SECRET is not set — blocking protected routes")
    if (!isPublicRoute) {
      const loginUrl = new URL("/login", req.nextUrl.origin)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  const token = await getToken({
    req,
    secret,
    secureCookie: process.env.NODE_ENV === "production",
  })

  const uid =
    (typeof token?.id === "string" && token.id.length > 0 ? token.id : null) ||
    (typeof token?.sub === "string" && token.sub.length > 0 ? token.sub : null)
  const accountActive = token?.accountActive !== false
  const isLoggedIn = Boolean(uid && accountActive)

  if (!isLoggedIn && !isPublicRoute) {
    const loginUrl = new URL("/login", req.nextUrl.origin)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isLoggedIn && (pathname === "/login" || pathname === "/signup")) {
    const continueUrl = new URL("/auth/continue", req.nextUrl.origin)
    const callbackUrl = req.nextUrl.searchParams.get("callbackUrl")
    if (callbackUrl) {
      continueUrl.searchParams.set("callbackUrl", callbackUrl)
    }
    return NextResponse.redirect(continueUrl)
  }

  if (pathname.startsWith("/admin")) {
    if (token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|fonts|assets).*)"],
}
