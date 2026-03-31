import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import type { Adapter } from "next-auth/adapters";
import { db } from "@/lib/db";

/** NextAuth middleware resolves session via JWT on the Edge runtime — Prisma cannot run there. */
function isEdgeRuntime() {
  return process.env.NEXT_RUNTIME === "edge";
}

/** Prefer custom `id`; fall back to standard JWT `sub` (some runtimes only hydrate `sub`). */
function tokenUserId(token: {
  id?: unknown;
  sub?: unknown;
}): string | undefined {
  const id =
    typeof token.id === "string" && token.id.length > 0 ? token.id : undefined;
  if (id) return id;
  const sub =
    typeof token.sub === "string" && token.sub.length > 0
      ? token.sub
      : undefined;
  return sub;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db) as Adapter,
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: { params: { prompt: "consent select_account" } },
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from:
        process.env.EMAIL_FROM || "YearInReview <noreply@yearinreview.online>",
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user?.id) return true;
      const row = await db.user.findUnique({
        where: { id: user.id },
        select: { disabledAt: true },
      });
      if (row?.disabledAt) return false;
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.sub = user.id;
        token.role = (user as any).role;
        token.planTier = (user as any).planTier;
        token.accountActive = !(user as any).disabledAt;
        token.roleSyncedAt = Date.now();
        return token;
      }

      const SYNC_MS = 30_000;
      const stale =
        trigger === "update" ||
        token.roleSyncedAt == null ||
        Date.now() - (token.roleSyncedAt as number) > SYNC_MS;

      const uid = tokenUserId(token);
      if (uid && stale) {
        if (isEdgeRuntime()) {
          // Skip DB refresh; Node (RSC / route handlers) will sync on the same navigation.
          return token;
        }
        try {
          const dbUser = await db.user.findUnique({
            where: { id: uid },
            select: { role: true, planTier: true, disabledAt: true },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.planTier = dbUser.planTier;
            token.accountActive = !dbUser.disabledAt;
          } else {
            // Do not set accountActive=false here: a transient DB/read issue or id drift
            // would log everyone out after the first 30s refresh. Back off like a failed query.
            console.warn(
              "[auth] jwt refresh: no user row for token id; keeping session",
            );
            token.roleSyncedAt = Date.now();
            return token;
          }
        } catch (err) {
          console.error("[auth] jwt DB refresh failed:", err);
          // Keep last-known token; backoff so a bad DB doesn’t retry every request.
          token.roleSyncedAt = Date.now();
          return token;
        }
        token.roleSyncedAt = Date.now();
      }

      return token;
    },
    session({ session, token }) {
      const uid = tokenUserId(token);
      if (token.accountActive === false || !uid) {
        return {
          ...session,
          user: {
            id: "",
            name: null,
            email: null,
            image: null,
            role: "USER",
            planTier: "FREE",
          },
        };
      }
      if (session.user) {
        session.user.id = uid;
        session.user.role = token.role as any;
        session.user.planTier = token.planTier as any;
      }
      return session;
    },
  },
});
