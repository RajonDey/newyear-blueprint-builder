# YearInReview

A planning + reflection app built around the **PARA / Second Brain** model. Set life areas, run projects against them, drop one-off thoughts into a quick-capture inbox, and reflect weekly / monthly / quarterly. Pro adds depth (custom Areas, up to 20 projects, file uploads, full Wrapped, advanced analytics).

Production: [yearinreview.online](https://yearinreview.online)

## Stack at a glance

Next.js 16 (App Router · RSC) · TypeScript · PostgreSQL on Neon · Prisma 6 (multi-file schema) · NextAuth v5 · Lemon Squeezy · Resend · shadcn/ui · Tailwind · framer-motion · recharts · cmdk.

Server state lives in RSC + `src/lib/queries/*`. Component state is plain `useState`. No Zustand, no React Query, no react-hook-form.

## Quickstart

```bash
git clone <repo> && cd newyear-blueprint-builder
cp .env.example .env.local            # fill in DATABASE_URL + auth secrets
npm install
npm run db:deploy                     # applies prisma/migrations
npm run dev                           # http://localhost:3000
```

That's enough to log in (use the magic-link flow if Google OAuth isn't configured).

To make yourself an admin, sign in once so the row exists, then:

```bash
SEED_ADMIN_EMAILS="you@example.com" npm run db:seed
```

Wait ≤30s for the JWT to refresh and `/admin` becomes accessible.

## Common scripts

```bash
npm run dev          # turbopack dev server
npm run build        # production build
npm run db:push      # quick prototype: push schema without writing a migration
npm run db:migrate   # create a new migration (prisma migrate dev --create-only)
npm run db:deploy    # apply migrations (prisma migrate deploy) — production / CI
npm run db:seed      # seed default areas + promote admin emails
npm run db:studio    # open Prisma Studio
```

## Repo layout

```
src/
├── app/              Next.js routes + API endpoints
│   ├── (marketing)/  public site
│   ├── (auth)/       sign-in / sign-up
│   ├── (app)/        authenticated portal
│   ├── admin/        admin portal (role-gated)
│   └── api/          route handlers
├── components/       domain folders + ui/ + shared/ + atmosphere/
├── lib/
│   ├── queries/      one file per surface
│   ├── auth.ts       NextAuth config
│   └── …
├── emails/           React Email templates
└── types/

prisma/
├── schema/           multi-file Prisma schema (00-base … 70-system)
├── migrations/       baseline + para_foundation + drop_goal_notes
└── seed.ts

docs/
├── PRODUCTION_STANDARDS.md  mandatory rules for new features (AI + humans)
├── ARCHITECTURE.md          one-page architecture overview
├── VISION.md                product IA, dual-surface pattern, scope lock
├── PARA.md                  entity mapping (Area → Project → Task)
├── AUTH_PRODUCTION.md       production auth + abuse runbook
├── DEPLOYMENT.md            env, Neon, Lemon Squeezy, Vercel
├── TESTING.md               how to run unit + E2E tests
├── CHANGELOG.md             shipped features by release
├── _archive/                historical phase plans (read-only)
└── plan/                    launch checklist + decisions log

.cursor/rules/                AI / agent conventions (production-standards · api-routes · components · dashboard · database · general · naming)
```

## Where to look when…

| You want to… | Read |
|---|---|
| **Build a new feature (start here)** | [`docs/PRODUCTION_STANDARDS.md`](docs/PRODUCTION_STANDARDS.md) |
| Run / extend tests | [`docs/TESTING.md`](docs/TESTING.md) |
| Understand the data model | [`docs/PARA.md`](docs/PARA.md) + `prisma/schema/*.prisma` |
| Understand product IA | [`docs/VISION.md`](docs/VISION.md) |
| Quick diagrams (ER, PARA, nav) | [`docs/DIAGRAMS.md`](docs/DIAGRAMS.md) |
| Add a new page in the app shell | [`.cursor/rules/dashboard.mdc`](.cursor/rules/dashboard.mdc) |
| Add an API endpoint | [`.cursor/rules/api-routes.mdc`](.cursor/rules/api-routes.mdc) |
| Touch the schema | [`.cursor/rules/database.mdc`](.cursor/rules/database.mdc) |
| Ship to production | [`docs/plan/MVP_LAUNCH.md`](docs/plan/MVP_LAUNCH.md) + [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) |
| Understand a past decision | [`docs/plan/DECISIONS.md`](docs/plan/DECISIONS.md) |
| See what's shipped | [`docs/CHANGELOG.md`](docs/CHANGELOG.md) |
| Phase execution history | [`docs/_archive/`](docs/_archive/) (archived plans + progress logs) |

## License

Private — all rights reserved.
