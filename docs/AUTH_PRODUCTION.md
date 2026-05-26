# Auth & security — production roadmap

## P0 (implemented)

- **Rate limiting** — `/api/auth/*` limited by IP when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set (`src/lib/rate-limit-auth.ts`, `middleware.ts`).
- **Production env checklist** — `docs/DEPLOYMENT.md` → _Production checklist — auth & abuse (P0)_.
- **Account exit** — Settings → **Danger zone** → delete account (`DELETE /api/user/account`), with typed confirmation `DELETE MY ACCOUNT`, Pro/billing notice, and `signOut` after success.
- **Disabled / deleted users** — `User.disabledAt` in Prisma; `signIn` callback blocks disabled users; JWT refresh sets `accountActive` when a **matching user row** exists; neutered session clears `user.id` so middleware and APIs treat the user as signed out (`src/lib/auth.ts`, `auth-guard.ts`, `middleware.ts` uses `req.auth?.user?.id`).
- **JWT `sub` + missing row** — Session `user.id` resolves from `token.id` **or** `token.sub`. On Node refresh, if no user row exists for the token id, we try **email rebind** (same person, different DB after `DATABASE_URL` switch). If still missing, `accountActive=false` and the session is neutered (`user.id` cleared) so middleware/APIs treat the user as signed out. Transient DB errors during refresh still keep the last-known token (backoff).
- **Session lifetime** — JWT `maxAge` is **7 days** (`src/lib/auth.ts`). Role/planTier still sync every ~30s on Node.
- **DB-verified guards** — `resolveSessionUser()` / `requireSessionUser()` in `auth-guard.ts` confirm the user row exists (with email fallback) before RSC pages and API routes trust `session.user.id`. `requireApiSession()` uses the same check.
- **Fresh sign-in** — Login/signup forms call `signOut({ redirect: false })` before `signIn()` so stale cookies do not survive environment or database switches.
- **Edge vs Node (important)** — Middleware resolves the JWT on **Edge**, where **Prisma must not run**. The `jwt` callback skips the DB refresh when `NEXT_RUNTIME === "edge"`; the **Node** part of the request (RSC `auth()`, etc.) performs the ~30s role / `disabledAt` sync. Without this guard, after ~30s every navigation can throw in `jwt` and look like a logout.
- **Rate limit scope** — Only non-GET `/api/auth/*` traffic is limited so `/api/auth/session` isn’t starved during normal use.
- **Login errors** — `?error=SessionInvalid` and other Auth.js codes surfaced on `/login` and `/signup` (`LoginForm`).

After pulling schema changes, apply the database:

```bash
npm run db:deploy
```

(Uses `prisma/migrations/`. For local-only experiments you can still use `npm run db:push`, but production should use `db:deploy`.)

## P1 (recommended next)

1. ~~**JWT `maxAge` / refresh policy**~~ — **Done:** 7-day JWT `maxAge`; 30s role sync unchanged.
2. **Security headers** — HSTS, CSP baseline (`next.config` or Vercel headers).
3. **Monitoring** — Alerts on spikes of 401/429 on `/api/auth/*`.
4. **Admin audit log** — Table of destructive admin actions before multiple operators use `/admin`.

## Optional later

- 2FA (especially for admins).
- Machine-readable **data export** — shipped in Settings (`GET /api/export`).
- Token denylist for instant global logout.
