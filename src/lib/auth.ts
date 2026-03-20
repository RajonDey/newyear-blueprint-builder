import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import Resend from "next-auth/providers/resend"
import type { Adapter } from "next-auth/adapters"
import { db } from "@/lib/db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db) as Adapter,
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM || "YearInReview <noreply@yearinreview.online>",
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.planTier = (user as any).planTier
        token.roleSyncedAt = Date.now()
        return token
      }

      // JWT keeps role/planTier from sign-in; refresh from DB so admin / subscription edits apply
      // without forcing sign-out (throttled to limit queries).
      const SYNC_MS = 30_000
      const stale =
        trigger === "update" ||
        token.roleSyncedAt == null ||
        Date.now() - (token.roleSyncedAt as number) > SYNC_MS

      if (token.id && stale) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, planTier: true },
        })
        if (dbUser) {
          token.role = dbUser.role
          token.planTier = dbUser.planTier
        }
        token.roleSyncedAt = Date.now()
      }

      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as any
        session.user.planTier = token.planTier as any
      }
      return session
    },
  },
})
