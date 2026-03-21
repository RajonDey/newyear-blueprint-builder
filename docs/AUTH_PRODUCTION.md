# Auth & security — production roadmap

## P0 (implemented)

- **Rate limiting** — `/api/auth/*` limited by IP when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set (`src/lib/rate-limit-auth.ts`, `middleware.ts`).
- **Production env checklist** — `docs/DEPLOYMENT.md` → *Production checklist — auth & abuse (P0)*.
- **Account exit** — Settings → **Danger zone** → delete account (`DELETE /api/user/account`), with typed confirmation `DELETE MY ACCOUNT`, Pro/billing notice, and `signOut` after success.
- **Disabled / deleted users** — `User.disabledAt` in Prisma; `signIn` callback blocks disabled users; JWT refresh sets `accountActive` when a **matching user row** exists; neutered session clears `user.id` so middleware and APIs treat the user as signed out (`src/lib/auth.ts`, `auth-guard.ts`, `middleware.ts` uses `req.auth?.user?.id`).
- **JWT `sub` + missing row** — Session `user.id` resolves from `token.id` **or** standard `token.sub`. If a DB refresh finds **no** user row, we **do not** revoke the session (avoids false logouts after ~30s from flaky reads or id drift); we log a warning and backoff. Rows with `disabledAt` still revoke. Truly deleted accounts may keep a JWT until it expires—tighten with shorter `maxAge` or explicit sign-out if needed.
- **Edge vs Node (important)** — Middleware resolves the JWT on **Edge**, where **Prisma must not run**. The `jwt` callback skips the DB refresh when `NEXT_RUNTIME === "edge"`; the **Node** part of the request (RSC `auth()`, etc.) performs the ~30s role / `disabledAt` sync. Without this guard, after ~30s every navigation can throw in `jwt` and look like a logout.
- **Rate limit scope** — Only non-GET `/api/auth/*` traffic is limited so `/api/auth/session` isn’t starved during normal use.
- **Login errors** — `?error=SessionInvalid` and other Auth.js codes surfaced on `/login` and `/signup` (`LoginForm`).

After pulling schema changes, apply the database:

```bash
npm run db:deploy
```

(Uses `prisma/migrations/`. For local-only experiments you can still use `npm run db:push`, but production should use `db:deploy`.)

## P1 (recommended next)

1. **JWT `maxAge` / refresh policy** — Shorter session lifetime + document tradeoffs vs. your current 30s role sync.
2. **Security headers** — HSTS, CSP baseline (`next.config` or Vercel headers).
3. **Monitoring** — Alerts on spikes of 401/429 on `/api/auth/*`.
4. **Admin audit log** — Table of destructive admin actions before multiple operators use `/admin`.

## Optional later

- 2FA (especially for admins).
- Machine-readable **data export** for privacy requests.
- Token denylist for instant global logout.
