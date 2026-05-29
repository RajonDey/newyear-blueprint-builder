# Deployment Guide

> Auth & abuse production runbook lives in [`AUTH_PRODUCTION.md`](./AUTH_PRODUCTION.md). Launch readiness checklist lives in [`plan/MVP_LAUNCH.md`](./plan/MVP_LAUNCH.md). This file is the one-page "how do I get from zero to running" guide.

## Prerequisites

- Node.js 20+ (`engines` in `package.json` allows up to 23)
- Neon PostgreSQL database
- Vercel account
- Google OAuth credentials
- Lemon Squeezy account
- Resend account (verified sending domain)
- Vercel Blob token (only needed once Pro users start uploading attachments)
- Upstash Redis (optional but recommended — see `AUTH_PRODUCTION.md`)

## Environment

1. Copy `.env.example` to `.env.local`
2. Fill in every value (comments in `.env.example` explain each one)
3. Generate the two secrets:
   ```bash
   openssl rand -base64 32   # NEXTAUTH_SECRET
   openssl rand -base64 32   # CRON_SECRET
   ```
4. Production `NEXTAUTH_URL` MUST exactly match the public origin (no trailing slash). Wrong value silently breaks OAuth and magic links.

## Database

1. Create a Neon project, copy the connection string into `DATABASE_URL`.
2. **Staging dry-run (required before production):** Clone or branch your Neon DB, point `DATABASE_URL` at it, then run `npm run db:deploy`. Confirm the app boots and critical flows work (sign-in, dashboard, weekly check-in). Only then run `db:deploy` on production.
3. Apply the schema:
   - **Production:** `npm run db:deploy` — runs Prisma's `migrate deploy` against the migrations in `prisma/migrations/`.
   - **Local prototyping:** `npm run db:push` is fine but skips migration history.
4. If `migrate deploy` reports **P3005** ("non-empty database") on an existing DB that previously only used `db push`, sync first with `npm run db:push`, then mark the shipped migrations as applied:
   ```bash
   npx prisma migrate resolve --applied 00000000000000_baseline
   npx prisma migrate resolve --applied 20260514000000_para_foundation
   npx prisma migrate resolve --applied 20260515000000_drop_goal_notes
   ```
5. Seed default areas + (optionally) the first admin — see _Admin users_ below.

## Admin users

`/admin` is gated by `User.role === ADMIN` in middleware. Normal sign-ups get `USER`.

### Option A — Seed (recommended for local / known emails)

1. Sign in once with Google or magic link so the row exists in `users`.
2. In `.env.local`, set `SEED_ADMIN_EMAILS="you@example.com"`.
3. Run `npm run db:seed`.
4. Reload the app (or wait ≤30s for the JWT to refresh `role`).

### Option B — Direct SQL

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'you@example.com';
```

### Option C — Prisma Studio

```bash
npm run db:studio
```

Edit `users.role` to `ADMIN`, sign out + back in.

In **production** prefer SQL or Studio for the first admin — don't ship `SEED_ADMIN_EMAILS` as a long-term env var on Vercel.

## Vercel deployment

### Branch strategy
- `main` → production
- `develop` → staging (if configured)
- `feature/*` → preview deployments

### Setup
1. Import the project in Vercel.
2. Set environment variables per environment (see `.env.example` + `AUTH_PRODUCTION.md`).
3. Add the custom domain + SSL.
4. Add the Lemon Squeezy webhook pointing to `https://<your-domain>/api/webhooks/lemonsqueezy`.

### Lemon Squeezy env vars

| Variable | What |
|---|---|
| `LEMONSQUEEZY_API_KEY` | API key from LS dashboard |
| `LEMONSQUEEZY_STORE_ID` | Your store ID |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | Webhook signing secret |
| `LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID` | Yearly Pro variant ID |
| `LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID` | Monthly Pro variant ID (if used) |

### Cron jobs

`vercel.json`:

```json
{
  "crons": [
    { "path": "/api/cron/rhythm-hourly",     "schedule": "0 * * * *" },
    { "path": "/api/cron/streak-calculator", "schedule": "0 1 * * *" },
    { "path": "/api/cron/lifecycle",         "schedule": "0 10 * * *" },
    { "path": "/api/cron/email-health",      "schedule": "0 9 * * 1" }
  ]
}
```

Rhythm emails (weekly/monthly/quarterly/daily) run hourly and filter by each user's timezone. See [`EMAIL.md`](./EMAIL.md).

Cron endpoints check the `Authorization: Bearer ${CRON_SECRET}` header.

## Production checklist — auth & abuse (P0)

Use this alongside [`AUTH_PRODUCTION.md`](./AUTH_PRODUCTION.md) and [`plan/MVP_LAUNCH.md`](./plan/MVP_LAUNCH.md):

- [ ] `NEXTAUTH_URL` exactly matches the public origin (no trailing slash)
- [ ] `NEXTAUTH_SECRET` set (`openssl rand -base64 32`)
- [ ] Google OAuth redirect URI configured for production
- [ ] `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` set (auth, search, export rate limits)
- [ ] Account deletion flow tested (`DELETE /api/user/account` from Settings)
- [ ] Pro user deletion cancels Lemon subscription (test in LS test mode)
- [ ] Magic link arrives from production `EMAIL_FROM`; Resend domain verified
- [ ] New sign-up lands on `/onboarding`; returning login lands on `/dashboard`
- [ ] Disabled users blocked at sign-in (`User.disabledAt`)
- [ ] Non-GET `/api/auth/*` rate-limited when Upstash is configured

## Verifying a deploy

| Check | How |
|---|---|
| Auth works | Sign in with Google + magic link from production domain |
| Payments work end-to-end | Buy Pro → webhook → `users.planTier = PRO` |
| Pro features unlock | After `planTier=PRO`, `/rhythm/monthly`, `/analytics`, full Wrapped should show |
| Cron fires | Hit `/api/cron/weekly-reminder` with the secret; check Resend logs |
| Resources upload (Pro) | Attach a file in a Project; verify it lands in Vercel Blob |
