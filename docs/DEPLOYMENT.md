# Deployment Guide

## Prerequisites

- Node.js 20+
- Neon PostgreSQL database
- Vercel account
- Google OAuth credentials
- Lemon Squeezy account
- Resend account

## Environment Setup

1. Copy `.env.example` to `.env.local`
2. Fill in all values (see comments in `.env.example`)
3. Generate secrets:
   ```bash
   openssl rand -base64 32  # for NEXTAUTH_SECRET
   openssl rand -base64 32  # for CRON_SECRET
   ```

## Production checklist — auth & abuse (P0)

Before pointing a real domain at production, verify:

| Item | Why |
|------|-----|
| **`NEXTAUTH_URL`** | Must be the **exact** public origin (`https://yourdomain.com`), no trailing slash. Wrong value breaks OAuth and magic links. |
| **`NEXTAUTH_SECRET`** | Unique per environment; never commit; rotate if leaked. |
| **`UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`** | Enables **rate limiting** on `/api/auth/*` (60 req/min/IP). Without Upstash, auth is still functional but easier to abuse. [Upstash](https://upstash.com) has a free tier. |
| **`NEXT_PUBLIC_SUPPORT_EMAIL`** | Used in Settings (delete account copy) and legal pages. |
| **Google OAuth redirect URIs** | In Google Cloud Console, authorized redirect URIs must include `https://yourdomain.com/api/auth/callback/google`. |
| **HTTPS only** | Vercel provides TLS; do not serve production auth over plain HTTP. |

**Suspended accounts:** set column `"disabledAt"` on `users` to a timestamp; sign-in is rejected and existing JWTs become invalid on the next refresh (≤30s).

## Database Setup

1. Create a Neon project at https://neon.tech
2. Copy the connection string to `DATABASE_URL`
3. **Apply schema** (pick one workflow):
   - **Migrations (recommended for production):** with `DATABASE_URL` set, run `npm run db:deploy` (e.g. CI or a one-off before/after deploy). Migrations live in `prisma/migrations/`.
   - **Prototype / solo dev:** `npm run db:push` syncs the schema without writing migration history.
4. **Existing database that used only `db push`:** the first `migrate deploy` can fail with **P3005** (non-empty DB, no `_prisma_migrations`). Align the DB with `prisma/schema.prisma` using `npm run db:push`, then mark the already-shipped migrations as applied, e.g. `npx prisma migrate resolve --applied 20250320190000_add_user_disabled_at` (use the folder name under `prisma/migrations/`). After that, `npm run db:deploy` is safe for new migrations.
5. (Optional) Promote admin(s): see **Admin users** below, then `npm run db:seed`

## Admin users

`/admin` is gated by `User.role === ADMIN` in middleware. Normal sign-ups get `USER`.

### Option A — Seed (recommended for local / known emails)

1. Sign in once with Google or email magic link so the row exists in `users`.
2. In `.env.local`, set:
   ```bash
   SEED_ADMIN_EMAILS="you@example.com,other@example.com"
   ```
3. Run:
   ```bash
   npm run db:seed
   ```
4. **Reload the app** (or wait up to ~30s and navigate). The JWT callback refreshes `role` / `planTier` from the database on a short interval, so a full sign-out is no longer strictly required—but signing out and back in still works if you prefer.

The seed script lives at `prisma/seed.ts`. If `SEED_ADMIN_EMAILS` is empty, it logs a message and exits without error.

### Option B — SQL (Neon SQL editor or `psql`)

```sql
UPDATE users SET role = 'ADMIN' WHERE email ILIKE 'you@example.com';
```

Then sign out and sign back in.

### Option C — Prisma Studio

```bash
npm run db:studio
```

Open `users`, edit `role` to `ADMIN` for the right row. Sign out and sign back in.

### Production

- Prefer **one-off SQL** or Studio on production DB for the first admin, or set `SEED_ADMIN_EMAILS` **only on the machine running seed** (e.g. CI or local), not long-term in Vercel env, unless you intend to re-run seed on deploys.
- Remove or leave `SEED_ADMIN_EMAILS` empty in production after promotion to avoid accidental re-runs changing roles.

## Vercel Deployment

### Branch Strategy
- `main` → Production (yearinreview.online)
- `develop` → Staging (staging.yearinreview.online)
- `feature/*` → Preview deployments

### Setup
1. Import project in Vercel
2. Set environment variables for each environment
3. Configure custom domain
4. Set up Lemon Squeezy webhook pointing to `https://yourapp.com/api/webhooks/lemonsqueezy`

### Lemon Squeezy Environment Variables

Add these to your Vercel environment:

- `LEMONSQUEEZY_API_KEY` — API key from Lemon Squeezy dashboard
- `LEMONSQUEEZY_STORE_ID` — Your store ID
- `LEMONSQUEEZY_WEBHOOK_SECRET` — Webhook signing secret
- `LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID` — Product variant ID for Pro monthly
- `LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID` — Product variant ID for Pro yearly

## Cron Jobs (Vercel Cron)

Add to `vercel.json`:
```json
{
  "crons": [
    { "path": "/api/cron/weekly-reminder", "schedule": "0 18 * * 0" },
    { "path": "/api/cron/streak-calculator", "schedule": "0 1 * * *" },
    { "path": "/api/cron/quarterly-nudge", "schedule": "0 9 1 1,4,7,10 *" }
  ]
}
```
