# MVP Launch Checklist

> **Goal:** Ship a full, usable product — not a perfect one. Anything checked = "good enough for real users paying real money." Anything unchecked = blocker or conscious gap.

Last reviewed: **2026-05-21** (v1.0 feature-complete; P0 deploy items remain for production cutover)

> **Note:** Phase execution history lives in [`../_archive/`](../_archive/). Shipped features are in [`../CHANGELOG.md`](../CHANGELOG.md). This file is **launch-readiness** only — env, payments, email, deploy.

---

## P0 — Launch blockers (must complete at deploy time)

> **Code status (2026-05-21):** Application features are feature-complete for v1.0. Unchecked P0 items below require **production environment configuration** — not additional product code.

### Infrastructure & secrets

- [ ] `NEXTAUTH_URL` set to production domain (exact origin, no trailing slash)
- [ ] `NEXTAUTH_SECRET` generated (`openssl rand -base64 32`)
- [ ] Google OAuth client ID/secret configured for production redirect URI
- [ ] `RESEND_API_KEY` set with verified sending domain
- [ ] `EMAIL_FROM` set to a branded address (not `onboarding@resend.dev`)
- [ ] `DATABASE_URL` pointing to production Neon DB
- [ ] `npm run db:deploy` run on production DB (all migrations through `20260525133946_onboarding_fix`)
- [ ] `LEMONSQUEEZY_API_KEY`, `_STORE_ID`, `_WEBHOOK_SECRET`, `_PRO_YEARLY_VARIANT_ID` set for production
- [ ] `BLOB_READ_WRITE_TOKEN` set (Pro resource uploads)
- [ ] `CRON_SECRET` set for cron endpoint auth
- [ ] `UPSTASH_REDIS_REST_URL` + `_TOKEN` set (auth + search + export rate limits)
- [ ] `NEXT_PUBLIC_SUPPORT_EMAIL` set (used in Settings + legal pages)

### Payment end-to-end

- [ ] Test checkout flow: click Upgrade → Lemon Squeezy → payment → webhook → `users.planTier = PRO`
- [ ] Verify `custom_data.user_id` round-trips through the LS webhook correctly
- [ ] Test subscription cancellation webhook → `planTier` reverts to FREE
- [ ] Test subscription expiry webhook
- [ ] Verify pricing page amounts match the active LS variant

### Email deliverability

- [ ] Magic-link sign-in lands from production domain
- [ ] Weekly reminder cron fires and delivers (Friday 18:00 UTC)
- [ ] Monthly + quarterly nudge crons fire for opted-in Pro users
- [ ] Confirm emails reach inbox (not spam) — check SPF / DKIM / DMARC on the sending domain

### Marketing claims vs shipped product

- [x] ~~PDF export claim removed (feature not built)~~ — fixed in code
- [x] ~~Year Wrapped gating aligned with "premium" copy~~ — fixed
- [x] ~~Marketing rebuild aligned to YIR aesthetic + shipped features~~ — May 2026
- [x] ~~Pricing / FAQ / how-it-works reflect PARA renames~~ — Phases 2-7 + PC-02
- [x] ~~JSON export "coming soon"~~ — shipped PC-22 (`GET /api/export`, Settings download)
- [x] ~~Pro "unlimited" caps~~ — honest limits from `planLimits` (PC-02)

### Deployment

- [ ] App deployed and accessible at production URL
- [ ] Custom domain with SSL configured
- [ ] Vercel crons configured (`vercel.json`: weekly-reminder · daily-nudge · monthly-nudge · quarterly-nudge · streak-calculator)
- [ ] Seed admin user created (`SEED_ADMIN_EMAILS` or manual DB insert)

---

## P1 — Should fix before launch (but won't block)

### SEO & discoverability

- [x] ~~`robots.ts` added~~ — done
- [x] ~~OG image generated~~ — `src/app/opengraph-image.tsx` (PC-24)
- [ ] `sitemap.ts` generates correct production URLs (verify after domain swap)
- [ ] Google Search Console connected

### Error handling

- [x] ~~`global-error.tsx` added~~ — done
- [ ] Test error states: 404 pages, API failures, network offline (smoke pass)

### Product polish

- [ ] Test full onboarding as a fresh user (signup → wizard → dashboard → create project → tick a system)
- [ ] Test full Pro path (upgrade → monthly review → quarterly review → analytics → Wrapped)
- [x] ~~Mobile spot-check code pass~~ — PC-23 (founder manual pass on iPhone SE / 14 / Android still recommended)
- [ ] Dark mode spot-check on all major pages
- [ ] Lighthouse a11y ≥ 85 on `/login`, `/dashboard`, `/rhythm/weekly`, `/projects` (run before cutover)

### Security

- [x] ~~Confirm every API route has an auth check~~ — automated `api-auth-audit.test.ts` (PC-24)
- [ ] Disabled accounts blocked at sign-in (regression check after auth changes)
- [ ] Auth rate-limit smoke test (hammer `/api/auth/callback/email` from one IP)
- [ ] No secrets in client bundles or git history

### Automated QA (code shipped)

- [x] E2E smoke: marketing, auth gates, API 401, pricing/FAQ truth (`e2e/smoke.spec.ts`)
- [x] Optional authenticated path documented (`e2e/authenticated.spec.ts` + `docs/TESTING.md`)

---

## P2 — Can launch without (post-launch backlog)

### Features deferred

- [ ] PDF export of yearly plan
- [ ] **Echo AI coach** — explicitly skipped for v1
- [ ] Sharing / accountability partner
- [ ] Richer weekly email with personal stats
- [ ] Advanced analytics (trends, comparisons)
- [ ] Monthly Pro pricing (yearly only for v1)
- [ ] Password auth (magic link + Google only for v1)

### Ops & monitoring

- [ ] Error tracking (Sentry or similar)
- [ ] Product analytics (Plausible / PostHog)
- [ ] Database backups verified on Neon
- [ ] Uptime monitoring
- [ ] Customer support channel (email or Discord)

### Hardening

- [ ] General API rate limiting (beyond auth/search/export)
- [ ] Admin panel audit log
- [ ] WCAG AA full compliance pass
- [ ] Core Web Vitals audit

---

## Product feature inventory (what ships in MVP v1.0)

> All PARA renames have landed. Sidebar IA was finalised in Phase 9. Product-completeness pass added export, email prefs, knowledge indexes, vision linking, area health, mobile polish.

| Feature | Status | Tier |
|---|---|---|
| Google OAuth + magic-link auth | ✅ Ready | Free |
| Onboarding (wizard) + week-one checklist | ✅ Ready | Free |
| Wheel of Life (`/wheel`) | ✅ Ready | Free |
| Vision board (`/vision`) | ✅ Ready | Free 5 items · Pro 50 |
| Areas (`/areas`) + health rollup | ✅ Ready | Free 6 defaults · Pro custom up to 50 |
| Projects (`/projects`) | ✅ Ready | Free 3 · Pro 20 |
| Tasks (`/tasks`) | ✅ Ready | Free 10/project · Pro 200/project |
| Systems (`/systems`) + heatmap | ✅ Ready | Free 3/project · Pro 10/project |
| Anti-goals | ✅ Ready | Free 3/plan · Pro 50/plan |
| Quick Capture (⌘K) | ✅ Ready | All |
| Drift inbox (`/drifts`) | ✅ Ready | All |
| Daily mood + reflection + anti-goal pill (TodayCard) | ✅ Ready | All |
| Notes (polymorphic) + `/knowledge/notes` index | ✅ Ready | Free 50 · Pro 5000 |
| Resources — link + file (Blob) | ✅ Ready | Free links · Pro files |
| Weekly Planner (plan + review) | ✅ Ready | Free |
| Week navigation | ✅ Ready | Free |
| Streaks & achievements | ✅ Ready | Free |
| Monthly Review + plan | ✅ Ready | Pro |
| Quarterly Review + plan | ✅ Ready | Pro |
| Analytics dashboard + DailyState trends | ✅ Ready | Pro |
| Year Wrapped — summary / full | ✅ Ready | Free / Pro |
| JSON export (`GET /api/export`) | ✅ Ready | Free + Pro |
| Email reminders + Settings toggles | ✅ Ready | All (opt-out) |
| Settings (profile, year, export, notifications, billing) | ✅ Ready | Free |
| Admin panel | ✅ Ready | Admin |
| Marketing site + legal pages | ✅ Ready | Public |

---

## How to use this file

1. Work through P0 items top-to-bottom at **deploy time**. Each needs a ✅ or an explanation.
2. Move to P1 — fix what you can, consciously skip what you can't.
3. Once all P0 ✅ and most P1 ✅ → **you can launch.**
4. P2 becomes the post-launch backlog.
5. Tick boxes here as they ship. Update the "Last reviewed" date when you do a pass.

**When every P0 is checked, you are ready to launch.**

See also: [`docs/CHANGELOG.md`](../CHANGELOG.md) **v1.0.0** release notes.
