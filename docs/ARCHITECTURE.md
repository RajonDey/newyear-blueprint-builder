# YearInReview v2 — Architecture

## Overview

YearInReview is an annual planning platform built with Next.js 15 (App Router), PostgreSQL (Neon), and deployed on Vercel.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Database | PostgreSQL via Neon |
| ORM | Prisma 6 |
| Auth | NextAuth v5 (Auth.js) |
| Payments | Lemon Squeezy (subscriptions) |
| Email | Resend |
| UI | shadcn/ui + Tailwind CSS 3 |
| State | Zustand (client) + React Query (server) |
| Charts | Recharts |
| Animations | Framer Motion |
| Deploy | Vercel |

## Route Groups

- `(marketing)` — Public pages: landing, pricing, blog, legal
- `(auth)` — Login/signup (centered card layout)
- `(app)` — Authenticated user portal (sidebar layout)
- `admin` — Admin portal (role-guarded)

## Authentication Flow

1. User signs up via Google OAuth or email magic link (Resend)
2. NextAuth v5 creates session + stores user in Postgres via Prisma adapter
3. Middleware protects all `(app)` and `admin` routes
4. Admin routes additionally check `role === ADMIN`

## Subscription Model

- **Free tier**: Planning wizard, 3 goals, weekly check-ins, basic streaks
- **Pro tier ($49/year)**: Unlimited goals, quarterly reviews, analytics, AI coach, streak shields

## Key Directories

```
src/app/          — Next.js routes and API endpoints
src/components/   — React components organized by feature
src/lib/          — Shared utilities, config, DB client, auth
src/hooks/        — Custom React hooks
src/stores/       — Zustand stores
src/types/        — TypeScript type definitions
src/emails/       — React Email templates
prisma/           — Database schema and migrations
docs/             — Documentation
.cursor/rules/    — Cursor AI coding rules
```
