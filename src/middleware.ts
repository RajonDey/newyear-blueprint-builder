import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { rateLimitAuthIfConfigured } from "@/lib/rate-limit-auth"

const publicRoutes = [
  "/",
  "/login",
  "/signup",
  "/pricing",
  "/features",
  "/blog",
  "/terms",
  "/privacy",
  "/refund",
  "/cookies",
]

export default auth(async (req) => {
  const pathname = req.nextUrl.pathname

  if (pathname.startsWith("/api/auth")) {
    const rateLimited = await rateLimitAuthIfConfigured(req)
    if (rateLimited) return rateLimited
  }

  const isLoggedIn = Boolean(req.auth?.user?.id)
  const isApiRoute = pathname.startsWith("/api")
  const isStaticAsset =
    pathname.startsWith("/_next") || pathname.includes(".")

  if (isApiRoute || isStaticAsset) {
    return NextResponse.next()
  }

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  if (!isLoggedIn && !isPublicRoute) {
    const loginUrl = new URL("/login", req.nextUrl.origin)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (pathname.startsWith("/admin")) {
    if (req.auth?.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|fonts|assets).*)"],
}
