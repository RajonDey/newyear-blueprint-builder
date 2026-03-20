# Product review — YearInReview

**Review date:** March 2026  
**Scope:** Full codebase and route audit (Next.js App Router, `src/app`, `src/components`, `prisma/schema.prisma`, `docs/`).  
**Method:** Static inspection—no live user tests or analytics.

This document satisfies the product checklist (sections 1–10) with **evidence**, **gaps**, and **recommended next actions**. It is the canonical record if chat history is unavailable.

---

## At a glance


| Area                   | Status                                                                | Severity of gaps         |
| ---------------------- | --------------------------------------------------------------------- | ------------------------ |
| 1. Legal & structure   | Routes exist; **policy copy is placeholder**                          | High (legal)             |
| 2. Landing & marketing | **Updated:** conversion-focused home + `/features`; sitemap expanded   | Low–medium               |
| 3. Authentication      | Solid NextAuth + admin gate                                           | Low                      |
| 4. UX & usability      | Coherent app shell; label/IA nits                                     | Low–medium               |
| 5. Dashboard & goals   | Feature-rich                                                          | Low                      |
| 6. Weekly system       | Plan + review + bridge to next week + systems surfacing               | Low                      |
| 7. Quarterly system    | Pro-gated reflective workflow; not quest-based                        | Medium (positioning)     |
| 8. UI consistency      | Shared primitives; some title patterns vary                           | Low                      |
| 9. Plan creation flow  | 7-step persisted wizard                                               | Medium (resume/drop-off) |
| 10. Phase roadmap      | Phases A–D implemented in code; **no prior doc**—this file + appendix | —                        |


---

## 1. Legal & structure

**Current state**

- **Terms** (`src/app/(marketing)/terms/page.tsx`), **Privacy** (`privacy/page.tsx`), and **Refund** (`refund/page.tsx`) are real routes, included in `middleware.ts` public routes, and linked from the marketing footer (`(marketing)/layout.tsx`).
- Footer: brand line, legal links, copyright year—clear and on-brand.

**Status (updated)**

- **Terms**, **Privacy**, **Refund**, **Cookie Policy**, and a **California (CPRA) notice** at `/privacy/california` are implemented in `src/app/(marketing)/` with a shared `LegalDocument` wrapper and `NEXT_PUBLIC_SUPPORT_EMAIL` in `.env.example`. Footer and marketing mobile nav link to them; `/cookies` is on the public route list in `middleware.ts`.
- Copy is **standard SaaS boilerplate**, not a substitute for counsel—each page includes a short disclaimer to that effect.

**Recommendations**

- Have qualified **attorney review** and substitute your **legal entity name**, **governing law**, and **contact** details where appropriate.
- Align refund windows and processor language with your **actual Lemon Squeezy** product configuration.

---

## 2. Landing & marketing

**Positioning (product decision)**

- **Evolve into a light marketing site**, not a single splash: home sells the outcome + loop (**reflect → plan → act → review**); **`/features`** is the long-form capability page for evaluators and SEO; **Pricing** and **Wisdom** (`/blog`) remain separate. No separate **About** page unless you add founder story or press—optional later.
- **Conversion focus:** primary CTA is **signup** everywhere; secondary is **pricing** or **features** for comparison shoppers. Trust line: free tier limits and “no card” repeated in hero and final CTA.
- **Clarity:** copy now names **weekly rhythm** and **daily systems** explicitly (aligned with the product). Sidebar/mobile nav label updated to **Weekly rhythm** to match the app.

**Implemented (code)**

- **`(marketing)/page.tsx`:** SEO `metadata`, sharper hero (problem + mechanism), **Why it works** outcomes strip, tightened journey + **What you get** grid (Pro tags where relevant), **Free vs Pro** teaser with CTAs, dual final CTA (signup + login).
- **`/features`:** New route (`(marketing)/features/page.tsx`) with tier badges (Free / Pro), grouped sections (Plan / Execute / Pro depth); linked from header, mobile nav, home, blog stub.
- **`/blog` (Wisdom):** On-brand empty state with CTAs to signup and features.
- **`src/app/sitemap.ts`:** Includes features, signup, blog, legal URLs (see current file).
- **`middleware.ts`:** `/features` is public.

**Wisdom / blog (implemented)**

- **`content/wisdom/*.mdx`** — MDX posts with frontmatter; **`next-mdx-remote`** (RSC) renders them.
- Routes: **`/blog`** (index), **`/blog/[slug]`** (article). See `content/wisdom/README.md` for how to add posts.
- **Sitemap** includes each article URL. Custom MDX blocks: `<Callout>`, `<SignupCta />` (`src/components/wisdom/wisdom-mdx-components.tsx`).

**Remaining / optional**

- **FAQ** or **About** if support or press needs them.
- Add **remark-gfm** if you need GitHub-flavored tables/task lists in MDX.
- A/B test hero headline once you have traffic (PostHog or similar).

---

## 3. Authentication

**Current state**

- **NextAuth v5** in `src/lib/auth.ts`: Google OAuth, Resend magic link, Prisma adapter, JWT session with `role` and `planTier` on token; custom pages `/login`.
- **Route protection:** `middleware.ts` redirects unauthenticated users to login with `callbackUrl`; `/admin/`* requires `role === ADMIN"`.
- **Pro product access for QA:** `src/lib/plan-access.ts` documents that **admins get Pro surfaces** (analytics, quarterly) without a paid tier.

**Admin / seed (implemented)**

- **`prisma/seed.ts`:** reads **`SEED_ADMIN_EMAILS`** (comma-separated; case-insensitive); promotes existing users to `ADMIN`. Loads `.env` then `.env.local` via `dotenv`.
- **`docs/DEPLOYMENT.md`:** seed, SQL, Prisma Studio; **sign out / sign in** after role change so JWT picks up `role`.
- **`.env.example`:** `SEED_ADMIN_EMAILS`.

**Optional later**

- Dev-only auto-admin allowlist in auth callbacks if you want zero manual step before first login.

---

## 4. UX & usability

**Current state**

- Authenticated **sidebar** (`app-sidebar.tsx`) + **topbar** with theme toggle and account menu; **mobile drawer** (`mobile-nav.tsx`) mirrors primary nav.
- Premium items show sparkles when not Pro; upgrade CTA in sidebar footer.
- Empty states funnel to `/plan/new` (dashboard, quarterly, weekly when no plan).

**Gaps / drop-off risks**

- **Label drift:** Sidebar/mobile still say **“Weekly Check-in”** while the weekly page title and metadata use **“Weekly rhythm”** (`check-in/weekly/page.tsx`)—users may perceive two different features.
- **Wizard** is long (7 steps) with **localStorage persistence** (`yir-wizard`)—good for return visits, but no visible **“Save & continue later”** reassurance on early steps (perceived commitment).
- **Quarterly** and **Analytics** are Pro-gated; free users see gates—ensure pricing page promises match in-app labels.

**Recommendations**

- Align nav label with page title (pick one vocabulary).
- Add explicit copy on step 1–2 of the wizard about autosave / resume.
- Optional: `?tab=` deep link on weekly workspace for support links.

---

## 5. Dashboard & goals system

**Current state**

- **Dashboard:** stats, wheel chart, goals overview, quick actions, achievements (`dashboard/page.tsx` + query layer).
- **Goals:** list and detail routes; APIs under `/api/goals` use session auth and plan scoping.
- **Daily systems** tied to goals; checkpoint APIs exist for execution tracking.
- **Structure:** `AppContent` `narrow` | `wide` for readable line lengths on dense forms.

**Gaps**

- None critical from static review; ongoing polish is **empty states** when plan exists but goal count is zero on secondary surfaces.

**Recommendations**

- Keep dashboard CTAs aligned with weekly rhythm (“Plan this week”) where metrics show low engagement (product analytics, not code).

---

## 6. Weekly system

**Current state**

- **Weekly rhythm** page combines:
  - **This week’s plan** (`WeeklyPlan` model): priority goals, life area to protect, core/follow-up commitments (`/api/weekly-plan`).
  - **Weekly review / check-in** with optional **next week focus** stored on the check-in and surfaced as a **suggestion** the following week (`weekly-workspace` query + check-in API).
- **Daily Systems** today API exposes **weekly focus** for in-context execution (`systems-tracker.tsx`).

**Assessment**

- This is a **full weekly operating system**, not a single check-in form—matches the “planning + execution” intent.

**Recommendations**

- Monitor **week boundary** behavior (ISO week vs. user locale) if users report off-by-one; centralize week helper tests if not already.

---

## 7. Quarterly system

**Current state**

- **Quarterly Review** (`check-in/quarterly/page.tsx`): **Pro-gated** via `PremiumGate` + `hasProProductAccess` (admins bypass).
- **QuarterlyReviewForm:** per-quarter tabs, text areas (summary, wins, challenges, adjustments), wheel snapshot on save, API `/api/quarterly`.
- **Wizard** defines per-goal **checkpoints** by quarter (`WizardCheckpoint` in store)—these are **milestones**, not a separate “quest” runtime.

**Quest-based approach**

- There is **no** quest engine, XP, or task graph in the codebase. “Quest-like” behavior would be **new product scope** (e.g., guided missions linking checkpoints + quarterly review).

**Admin access**

- **Clarified in code:** admins have Pro product access for quarterly (and analytics) without subscription—see `plan-access.ts`.

**Recommendations**

- If marketing uses “quest” language, either **add lightweight guided prompts** or **soften copy** to “milestones & quarterly reflection.”
- Consider surfacing **wizard checkpoints** inside the quarterly UI as a checklist (reuse existing data).

---

## 8. UI consistency

**Current state**

- Shared: `AppContent`, `PageHeader`, `MandalaWatermark`, `OrnamentDivider`, shadcn primitives, `font-display` for headings.
- Marketing vs. app: consistent logo mark and typography family.

**Gaps**

- Not every page uses `PageHeader`—some use raw `h1` blocks (weekly, quarterly forms)—**acceptable** but slightly inconsistent.
- Sidebar uses `sidebar-`* tokens; main content uses default background—intentional, but document as the pattern for contributors.

**Recommendations**

- Add a short **UI patterns** subsection to `ARCHITECTURE.md` (when to use `PageHeader`, `AppContent` variants, empty states).

---

## 9. Plan creation flow

**Current state**

- **Seven steps** (`WIZARD_STEPS` in `wizard-store.ts`): Begin → Reflect → Discover (wheel) → Envision (goals) → Map (plan) → Release (anti-goals) → Activate (review).
- **Persistence:** Zustand `persist` to `localStorage` as `yir-wizard`.
- Entry: `/plan/new` renders `WizardShell`; submission via `/api/plans/wizard` (per API layout).

**Drop-off risks**

- Length and emotional weight (reflection + wheel + multiple goals) without a **progress indicator beyond the stepper** (time estimate).
- Clearing browser storage loses in-progress work unless user completes submit.

**Recommendations**

- Stepper already exists—add **estimated time** (“~15 min”) on welcome.
- Optional: **server-side draft plans** for logged-in users (larger effort).
- After submit, **celebrate completion** and deep-link to weekly rhythm or daily systems.

---

## 10. Final phase plan (improvement roadmap)

**Executed phases (codebase evidence — “Phase 1 delivery”)**


| Phase | Theme                                                   | Evidence                                                                       |
| ----- | ------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **A** | Admin/Pro access, tier semantics, marketing polish      | `plan-access.ts`, marketing nav/layout                                         |
| **B** | App shell typography & layout, mobile parity            | `AppContent`, `PageHeader`, `MobileNav` / marketing nav                        |
| **C** | Goals/systems execution CRUD, checkpoints, empty states | `/api/goals`, `/api/systems`, goal detail UI                                   |
| **D** | Weekly execution layer                                  | `WeeklyPlan`, `nextWeekFocus`, weekly workspace tabs, `weeklyFocus` on systems |


**Suggested execution order for “Phase 2” (post-review)**

1. **Legal completion** (Terms, Privacy)—unblocks trust and payments.
2. **Fix seed script** + document admin bootstrap.
3. **Sitemap + SEO** for public URLs.
4. **IA copy alignment** (weekly naming, wizard reassurance).
5. **Quarterly UX**—optional checkpoint linkage; clarify vs. “quests” in marketing.
6. **Deeper analytics** (if PostHog keys set)—funnel from landing → signup → wizard complete.

---

## Appendix: key file map


| Concern          | Location                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------ |
| Public routes    | `src/middleware.ts`                                                                              |
| Auth config      | `src/lib/auth.ts`                                                                                |
| Admin gate       | `src/middleware.ts`, `src/app/admin/`*                                                           |
| Pro gate         | `src/lib/plan-access.ts`, `PremiumGate` usage                                                    |
| Wizard           | `src/stores/wizard-store.ts`, `src/components/wizard/*`                                          |
| Weekly workspace | `src/app/(app)/check-in/weekly/page.tsx`, `src/lib/queries/weekly-workspace.ts`                  |
| Quarterly        | `src/app/(app)/check-in/quarterly/page.tsx`, `src/components/check-in/quarterly-review-form.tsx` |
| Schema           | `prisma/schema.prisma`                                                                           |
| Deploy / cron    | `docs/DEPLOYMENT.md`, `vercel.json` (if present)                                                 |


---

## Document maintenance

- Re-run this review after major feature ships or before **public launch**.
- Update the **At a glance** table and **Phase 2** ordering when priorities change.

