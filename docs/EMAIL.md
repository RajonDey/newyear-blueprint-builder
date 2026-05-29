# Email system — YearInReview

Product and lifecycle email spec, cost notes, and implementation. Auth magic links use the same Resend account via NextAuth (not templates in `src/emails/`).

## Status: complete

All planned email phases are implemented. Rhythm sends are **timezone-aware** (user `timezone`, default UTC). Production on **Vercel Hobby** uses the daily rhythm cron; hourly is optional on Pro.

| Phase | Scope | Status |
|-------|--------|--------|
| **1** | Branded shell, refactor rhythm emails, dedupe, cron throttle | Done |
| **2a** | Weekly plan (Sun 6 PM) + review (Fri 5 PM) | Done |
| **2b** | Pro monthly/quarterly plan + review | Done |
| **3** | Finish onboarding, welcome, Jan new year | Done |
| **4** | Dec year reflection | Done |
| **4b** | Timezone-aware sends, auto-detect TZ, monitoring | Done |

## Emails

| Email | Subject | Schedule | Who | Send if |
|-------|---------|----------|-----|---------|
| **Weekly plan** | Plan your week · Week {n} | **Sun 6 PM local** | Free + Pro | Active plan, no `WeeklyPlan` this ISO week |
| **Weekly review** | Review your week | **Fri 5 PM local** | Free + Pro | Active plan, no `WeeklyCheckIn` this ISO week |
| **Monthly plan** | Plan {Month} | **1st 8 AM local** | Pro | Active plan, no `MonthlyPlan` this month |
| **Monthly review** | Review {Month} | **25th 5 PM local** | Pro | Active plan, no `MonthlyReview` this month |
| **Quarterly plan** | Plan {Q} | **First Mon of quarter 8 AM local** | Pro | Active plan, no `QuarterlyPlan` this quarter |
| **Quarterly review** | Review {Q} | **15th of Mar/Jun/Sep/Dec 5 PM local** | Pro | Active plan, no `QuarterlyReview` this quarter |
| Daily habit nudge | Just one tiny habit today... | **10 AM local** when streak slips | Free + Pro | Daily streak last done 48–72h ago |
| **Finish onboarding** | Finish setting up your year | Daily 10:00 UTC | Signed up, no plan (24h+) | Once |
| **Welcome** | You're in — welcome to YearInReview | On onboarding + daily fallback | After first plan | Once |
| **New year setup** | Begin {Y} in YearInReview | Daily (Jan 2–7 **local**) | Has past plans, no active plan this year | Once per year |
| **Year reflection** | Look back at {Y} | Daily (Dec 20–28 **local**) | Active plan this year | Once per year |
| Magic link | (Auth.js / Resend) | On demand | Email login users | User requests sign-in |

All rhythm emails use `src/emails/layout/email-shell.tsx` (ivory paper, ink type, amber CTA).

## Cron architecture (production)

| Cron | Schedule | Role | Hobby `vercel.json` |
|------|----------|------|---------------------|
| **`/api/cron/rhythm-daily`** | Daily `0 6 * * *` | All rhythm emails — replays ~27 UTC hours so every timezone window is covered | **Yes (production on Hobby)** |
| **`/api/cron/rhythm-hourly`** | Hourly `0 * * * *` | Same emails, point-in-time windows — tighter timing on Vercel Pro | Pro only |
| **`/api/cron/lifecycle`** | Daily `0 10 * * *` | Finish onboarding, welcome fallback, new year, year reflection | Yes |
| **`/api/cron/streak-calculator`** | Daily `0 1 * * *` | Streak math (not email) | Yes |
| **`/api/cron/email-health`** | Mon `0 9 * * 1` | Volume guidance + active-user counts | Yes |

Legacy routes (`/api/cron/weekly-plan`, `/weekly-reminder`, `/daily-nudge`, `/monthly-*`, `/quarterly-*`) skip timezone windows — use only for manual debugging.

## User preferences

Settings → **Notifications** (`User.preferences.emailPreferences`). **Default: all on.**

| Key | UI label |
|-----|----------|
| `weeklyReviewReminder` | Weekly rhythm (Sunday plan + Friday review) |
| `monthlyNudge` | Monthly rhythm (1st plan + 25th review, Pro) |
| `quarterlyNudge` | Quarterly rhythm (first Monday plan + mid-quarter review, Pro) |
| `dailyNudge` | Daily rhythm nudge |

Lifecycle emails are transactional/one-time — no opt-out toggle.

## Timezone

- Stored on `User.timezone` (Settings or auto-detected on first app visit when still `UTC`).
- Rhythm dedupe uses **local calendar day** (`emailMeta.lastRhythmEmailDate` in user's timezone).
- ISO week / month / quarter eligibility uses the user's timezone.

## Dedupe and throttle

- **Max one rhythm email per user per local day** — `User.preferences.emailMeta.lastRhythmEmailDate`.
- Implemented in `src/lib/cron/send-rhythm-email.ts`.
- **Send delay** between recipients: `EMAIL_CRON_SEND_DELAY_MS` (default `100`).

## Monitoring

- Hourly rhythm cron logs a warning when sends in one run exceed `EMAIL_DAILY_WARN_THRESHOLD` (default **80**, Resend free cap is **100/day**).
- **`GET /api/cron/email-health`** (cron secret) returns active-user counts and upgrade recommendation.
- Check Resend dashboard weekly in production.

## Resend cost guidance

| Tier | Price | Limit | When to upgrade |
|------|-------|-------|-----------------|
| Free | $0 | 3,000/mo, **100/day** | Early launch |
| Pro | $20/mo | 50,000/mo, no daily cap | **~100–150 active users** |

Conditional sends + timezone spreading keep daily spikes low. Budget **Pro $20/mo** at ~100 active users with rhythm crons.

## Code map

| Path | Role |
|------|------|
| `src/emails/layout/email-shell.tsx` | Shared branded layout |
| `src/lib/email.ts` | Resend send helpers |
| `src/lib/cron/timezone-window.ts` | Local send windows + lifecycle date windows |
| `src/lib/cron/hourly-rhythm.ts` | Unified hourly rhythm dispatcher |
| `src/lib/cron/send-rhythm-email.ts` | Preference + dedupe + send + mark |
| `src/lib/cron/lifecycle-email.ts` | Onboarding, welcome, year emails |
| `src/lib/cron/email-monitoring.ts` | Volume warnings + health metrics |
| `src/components/shared/timezone-sync.tsx` | Browser timezone auto-detect |
| `src/app/api/cron/rhythm-hourly/` | Production rhythm cron |
| `src/app/api/cron/lifecycle/` | Lifecycle cron |
| `src/app/api/cron/email-health/` | Monitoring cron |
| `vercel.json` | Cron schedules |

## Env

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | Sending |
| `EMAIL_FROM` | From address (verified domain in prod) |
| `CRON_SECRET` | Protects cron routes |
| `EMAIL_CRON_SEND_DELAY_MS` | Optional ms between sends (default 100) |
| `EMAIL_DAILY_WARN_THRESHOLD` | Warn when one cron run sends ≥ N (default 80) |

See also [`AUTH_PRODUCTION.md`](./AUTH_PRODUCTION.md) and [`DEPLOYMENT.md`](./DEPLOYMENT.md).
