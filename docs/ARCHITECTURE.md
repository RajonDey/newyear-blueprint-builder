# YearInReview — Architecture

A planning + reflection app built around the **PARA / Second Brain** model. One-glance overview of what runs where and why.

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router, RSC by default) |
| Language | TypeScript (strict) |
| Database | PostgreSQL on Neon |
| ORM | Prisma 6 — **multi-file schema** under `prisma/schema/` |
| Auth | NextAuth v5 (Auth.js) — Google OAuth + magic link |
| Payments | Lemon Squeezy (yearly Pro) |
| Email | Resend (`src/emails/`) |
| Blob storage | Vercel Blob (Pro-only resource uploads) |
| Rate limiting | Upstash Redis (auth endpoints only) |
| UI | shadcn/ui + Tailwind CSS · framer-motion · recharts · cmdk |
| State | RSC + `lib/queries/*` for server state · `useState` for component-local state. **No Zustand / React Query / react-hook-form** — see `src/components/providers.tsx`. |
| Deploy | Vercel |

## Route groups

```
src/app/
├── (marketing)/   — public site: home, how-it-works, pricing, faq, about, legal
├── (auth)/        — sign-in / sign-up (centered card)
├── (app)/         — authenticated portal (sidebar + topbar shell)
├── admin/         — admin portal (role-gated in middleware)
└── api/           — route handlers (auth, billing, CRUD, cron)
```

`middleware.ts` protects `(app)` and `admin/*`. Admin routes additionally check `session.user.role === "ADMIN"`.

## Data model (PARA)

```
Area      (life domain — ongoing)
└─ Project   (concrete endeavour — has start + finish)
   ├─ Task          (one-off actionable unit)
   ├─ KeyResult     (measurable target 0–100)
   ├─ ProjectCheckpoint (quarterly milestone)
   └─ System        (recurring ritual)

Vision       (1:1 User — life-spanning vision board)
Note         } polymorphic via (parentType, parentId)
Resource     } parent ∈ AREA · PROJECT · TASK · SYSTEM · VISION · VISION_ITEM
Drift        (quick-capture inbox)
DailyState   (per-day mood / energy / reflection / anti-goal pill)
```

Prisma model names follow PARA terminology; underlying tables keep legacy names via `@@map` (`goals`, `actions`, `daily_systems`). See `docs/PARA.md` for the full mapping and `prisma/schema/*.prisma` for the wire format.

## Information architecture

Sidebar (4 groups, 11 items):

```
Today       Dashboard · Drift inbox
Plan        Areas · Projects · Tasks · Systems
Reflect     Weekly · Monthly · Quarterly · Analytics
Foundation  Wheel of Life · Vision · Anti-goals · Year Wrapped
```

Account-level surfaces (Settings · Admin · Sign out) live in the topbar avatar dropdown.

## Pricing & gating

- **Source of truth:** `src/lib/config.ts` → `planLimits` (Free vs Pro caps for every quota)
- **Access helper:** `src/lib/plan-access.ts` → `hasProProductAccess(planTier, role)`
- **Feature-level flags:** `src/lib/feature-flags.ts`
- **UI gating:** `<ProGate>` from `src/components/upgrade/pro-gate.tsx` (default fallback is `<ProUpsellCard>`)

## Key directories

```
src/
├── app/           Next.js routes + API endpoints
├── components/    React components by domain (areas, projects, drifts, …)
│   ├── ui/        shadcn primitives
│   ├── shared/    cross-cutting primitives (PageContainer, PageHeader, …)
│   └── atmosphere/ visual primitives (Eyebrow, ProMark, SoftBackdrop, …)
├── lib/
│   ├── queries/   one file per surface, returns everything a page needs
│   ├── auth.ts    NextAuth config + callbacks
│   ├── db.ts      Prisma singleton
│   └── …
├── emails/        React Email templates (Resend)
└── types/         shared TS types + NextAuth module augmentation

prisma/
├── schema/        multi-file Prisma schema (00-base … 70-system)
├── migrations/    baseline + para_foundation + drop_goal_notes
└── seed.ts

docs/
├── ARCHITECTURE.md      (this file)
├── VISION.md            product IA + scope lock
├── PARA.md              entity mapping
├── AUTH_PRODUCTION.md   production auth + abuse runbook
├── DEPLOYMENT.md        env vars, Neon, Lemon Squeezy, Vercel
├── CHANGELOG.md         shipped features
├── _archive/            historical phase plans
└── plan/                launch checklist + decisions log
```

## Where to start

- **New features / AI agents** → read **`docs/PRODUCTION_STANDARDS.md`** first (mandatory checklist · anti-patterns · reference implementations)
- **Adding a route** → read `.cursor/rules/dashboard.mdc` (page layout · primitives · gating · charts · motion)
- **Adding an API endpoint** → read `.cursor/rules/api-routes.mdc` (auth · validation · plan limits · status codes)
- **Touching the schema** → read `.cursor/rules/database.mdc` (multi-file layout · migration policy · query patterns)
- **Naming things** → `.cursor/rules/naming.mdc`
- **Understanding the model** → `docs/PARA.md`
- **Shipping to prod** → `docs/plan/MVP_LAUNCH.md`
