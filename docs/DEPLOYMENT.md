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

## Database Setup

1. Create a Neon project at https://neon.tech
2. Copy the connection string to `DATABASE_URL`
3. Push schema: `npm run db:push`
4. (Optional) Seed: `npm run db:seed`

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
