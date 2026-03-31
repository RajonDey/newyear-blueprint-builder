# MVP Launch Checklist

> **Goal**: Ship a full, usable product — not a perfect one.
> Anything checked here means "good enough for real users paying real money."
> Anything unchecked is a blocker or a conscious gap.

Last reviewed: 2026-03-30

---

## 🔴 P0 — Launch blockers (must complete)

### Infrastructure & Secrets
- [ ] `NEXTAUTH_URL` set to production domain
- [ ] `NEXTAUTH_SECRET` generated (openssl rand -base64 32)
- [ ] Google OAuth client ID/secret configured for production redirect URI
- [ ] `RESEND_API_KEY` set with verified sending domain
- [ ] `EMAIL_FROM` set to branded address (not onboarding@resend.dev)
- [ ] `DATABASE_URL` pointing to production Neon DB
- [ ] `npx prisma migrate deploy` run on production DB
- [ ] `LEMONSQUEEZY_API_KEY` set for production
- [ ] `LEMONSQUEEZY_STORE_ID` set
- [ ] `LEMONSQUEEZY_VARIANT_ID` set (yearly plan variant)
- [ ] `LEMONSQUEEZY_WEBHOOK_SECRET` set
- [ ] `CRON_SECRET` set for cron endpoint auth
- [ ] `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` set (auth rate limiting)

### Payment end-to-end
- [ ] Test checkout flow: click Upgrade → Lemon Squeezy → payment → webhook → user planTier=PRO
- [ ] Verify `custom_data.user_id` passes through LS webhook correctly
- [ ] Test subscription cancellation webhook → planTier reverts to FREE
- [ ] Test subscription expiry webhook
- [ ] Verify pricing page amounts match Lemon Squeezy product

### Email deliverability
- [ ] Magic link sign-in works from production domain
- [ ] Weekly reminder cron fires and delivers
- [ ] Check email lands in inbox (not spam) from production domain

### Marketing claims vs product
- [x] ~~PDF export claim removed (feature not built)~~ ← fixed in code
- [x] ~~Year Wrapped gating aligned with "premium" marketing copy~~ ← fixed in code
- [ ] Review all pricing/features page claims against actual shipped features

### Deployment
- [ ] App deployed and accessible at production URL
- [ ] Vercel crons configured (weekly-reminder, daily-nudge, quarterly-nudge)
- [ ] Custom domain configured with SSL
- [ ] Seed admin user created (`SEED_ADMIN_EMAILS` or manual DB insert)

---

## 🟡 P1 — Should fix before launch (but won't block)

### SEO & Discoverability
- [x] `robots.ts` added ← fixed in code
- [ ] OG image created and set in root layout metadata
- [ ] Verify sitemap.ts generates correct production URLs
- [ ] Google Search Console connected

### Error handling
- [x] `global-error.tsx` added ← fixed in code
- [ ] Test error states: 404 pages, API failures, network offline

### Product polish
- [ ] Test full onboarding flow as new user (signup → wizard → dashboard → goals → rhythm)
- [ ] Test as Pro user (upgrade → monthly review → quarterly review → analytics → wrapped)
- [ ] Mobile responsiveness spot-check on iPhone SE, iPhone 14, Android
- [ ] Dark mode spot-check on all major pages
- [ ] Lighthouse accessibility score > 85 on login, dashboard, weekly planner

### Security
- [ ] Review all API routes have auth checks
- [ ] Confirm disabled accounts are blocked
- [ ] Test rate limiting works on auth endpoints
- [ ] No secrets in client-side code or git history

---

## 🟢 P2 — Can launch without (post-launch backlog)

### Features deferred
- [ ] PDF export of yearly plan
- [ ] Planning Workspace / Notion-like pages
- [ ] AI coach / suggestions
- [ ] Sharing / accountability partner
- [ ] Richer weekly email with personal stats
- [ ] Advanced analytics trends & comparisons
- [ ] Monthly pricing option (currently yearly only)
- [ ] Password-based auth (currently magic link + Google only)

### Ops & monitoring
- [ ] Error tracking (Sentry or similar)
- [ ] Analytics (Plausible, PostHog, or similar)
- [ ] Database backups verified on Neon
- [ ] Uptime monitoring
- [ ] Customer support channel (email or Discord)

### Hardening
- [ ] General API rate limiting (beyond auth)
- [ ] Admin panel audit logs
- [ ] WCAG AA full compliance pass
- [ ] Performance audit (Core Web Vitals)
- [ ] Automated E2E tests for critical flows

---

## Product feature inventory (what ships in MVP)

| Feature | Status | Tier |
|---------|--------|------|
| Google OAuth + Magic Link auth | ✅ Ready | Free |
| Plan creation wizard (6 steps) | ✅ Ready | Free |
| Wheel of Life assessment | ✅ Ready | Free |
| Goals with key results, notes, timeline | ✅ Ready | Free (3 max) |
| Anti-goals | ✅ Ready | Free |
| Daily Habits tracker + 90-day heatmap | ✅ Ready | Free |
| Weekly Planner (plan + review) | ✅ Ready | Free |
| Week navigation (browse past weeks) | ✅ Ready | Free |
| Streaks & achievements | ✅ Ready | Free |
| Quick-start goal creation | ✅ Ready | Free |
| Monthly Review (12 months) | ✅ Ready | Pro |
| Quarterly Review (4 quarters) | ✅ Ready | Pro |
| Analytics dashboard | ✅ Ready | Pro |
| Year Wrapped | ✅ Ready | Pro |
| Unlimited goals | ✅ Ready | Pro |
| Settings (profile, timezone, billing) | ✅ Ready | Free |
| Admin panel | ✅ Ready | Admin |
| Marketing site (home, features, pricing) | ✅ Ready | Public |
| Legal pages (terms, privacy, cookies, refund) | ✅ Ready | Public |
| Email reminders (weekly, daily, quarterly) | ✅ Ready | Free |

---

## How to use this file

1. Work through 🔴 P0 items top-to-bottom. Each needs a ✅ or explanation.
2. Move to 🟡 P1 — fix what you can, consciously skip what you can't.
3. Once all P0 ✅ and most P1 ✅ → **you can launch**.
4. 🟢 P2 becomes your post-launch backlog.
5. Update this file as you check items off. Date each update.

**When every P0 is checked, you are ready to launch.**
