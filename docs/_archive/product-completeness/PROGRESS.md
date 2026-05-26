> **Archived 2026-05-21** — execution history. See [`CHANGELOG.md`](../../CHANGELOG.md) and [`plan/DECISIONS.md`](../plan/DECISIONS.md) for outcomes.

# Product Completeness — Progress Tracker

Update after every phase. Plan: [`PLAN.md`](./PLAN.md).

## Legend

- ⬜ Not started · 🟡 In progress · ✅ Done · ⏭️ Skipped · 🔁 Reopened

## Phase status

| Phase | Name | Status | Date | Build | Notes |
|-------|------|--------|------|-------|-------|
| PC-01 | Vision reconciliation & scope lock | ✅ | 2026-05-21 | n/a (docs) | VISION.md + PARA/DECISIONS reconciliation |
| PC-02 | Marketing & pricing truth pass | ✅ | 2026-05-21 | clean | marketing-plan-copy.ts; pricing, FAQ, how-it-works |
| PC-03 | Goal → Project language sweep | ✅ | 2026-05-21 | clean | rhythm, dashboard, projects, analytics, wrapped |
| PC-04 | LifeCategory ↔ Area user education | ✅ | 2026-05-21 | clean | onboarding, areas, wheel, area-card |
| PC-05 | Daily surface unification | ✅ | 2026-05-21 | clean | DAILY_HOME_HREF; redirect /rhythm/daily |
| PC-06 | Project creation & area context | ✅ | 2026-05-21 | clean | New project dialog; areaId quick-start |
| PC-07 | Tasks surface completeness | ✅ | 2026-05-21 | clean | Add task dialog + inline row; task create tests |
| PC-08 | YearlyPlan lifecycle | ✅ | 2026-05-21 | clean | Settings Your year; archive + start new year APIs |
| PC-09 | DailyState schema promotion | ✅ | 2026-05-21 | clean | antiGoalHeld columns; backfill migration |
| PC-10 | Rhythm workspace consolidation | ✅ | 2026-05-21 | clean | CadenceWorkspace; plan-form-state shared |
| PC-11 | Contextual hubs (Drifts · Anti-goals · Wrapped) | ✅ | 2026-05-21 | clean | Preview vs workspace framing; drift badge |
| PC-12 | Project detail progressive disclosure | ✅ | 2026-05-21 | clean | Wide container; accordions; unified section shells |
| PC-13 | Focus signals & priority context | ✅ | 2026-05-21 | clean | Weekly priority chips, badges on tasks/projects |
| PC-14 | Onboarding → week-1 guided path | ✅ | 2026-05-21 | clean | Week-one checklist; User.preferences; vision visit |
| PC-15 | Global search | ✅ | 2026-05-21 | clean | GET /api/search; cmdk search mode; 30/min rate limit |
| PC-16 | Knowledge index pages | ✅ | 2026-05-21 | clean | /knowledge/notes + resources; cursor pagination; Settings links |
| PC-17 | Note/resource discoverability | ✅ | 2026-05-21 | clean | Vision resources; View all links; Quick Capture |
| PC-18 | Vision ↔ Project linking | ✅ | 2026-05-21 | clean | visionItemId FK; project picker; vision chips; dashboard strip |
| PC-19 | Area health rollup | ✅ | 2026-05-21 | clean | healthScore composite; area cards; dashboard pulse |
| PC-20 | Analytics ↔ rhythm loop | ✅ | 2026-05-21 | clean | DailyState trends; streak/systems; review CTA |
| PC-21 | Notifications & email cadence | ✅ | 2026-05-21 | clean | email prefs in User.preferences; Settings toggles; crons |
| PC-22 | JSON export & data portability | ✅ | 2026-05-21 | clean | GET /api/export; Settings download; FAQ/pricing |
| PC-23 | Mobile & responsive polish | ✅ | 2026-05-21 | clean | thumb-first daily loop; rhythm stack; tasks/drifts |
| PC-24 | Launch QA & ops completion | ✅ | 2026-05-21 | clean | auth audit, OG image, E2E, MVP_LAUNCH, v1.0.0 changelog |

---

## Parking lot

Items noticed during a phase that belong elsewhere:

- _(empty)_

---

## Phase log

### PC-01 — Vision reconciliation & scope lock
- **Status:** ✅
- **Date:** 2026-05-21
- **Build:** n/a (documentation only)
- **Pre-flight docs read:** PARA.md, DECISIONS.md (Phase 8–9), nav-config.ts
- **Shipped:**
  - `docs/product-completeness/VISION.md` — mental model, dual-surface pattern, route map, scope lock
  - `PARA.md` — active routes updated; deprecated table corrected; decision history supersession notes
  - `DECISIONS.md` — 2026-05-21 dual-surface IA entry
- **Schema/API:** none
- **Plan deltas:** none
- **Follow-ups:** PC-02 marketing truth; PC-05 daily redirect

### PC-02 — Marketing & pricing truth pass
- **Status:** ✅
- **Date:** 2026-05-21
- **Build:** `next build` clean
- **Pre-flight docs read:** planLimits, DECISIONS marketing-claims rule, PC-01 VISION
- **Shipped:**
  - `src/lib/marketing-plan-copy.ts` — limits derived from `planLimits`
  - `pricing-plans.tsx` — accurate caps; JSON coming soon; monthly toggle shows Coming soon + disabled CTA
  - `pricing-compare.tsx` — projects/anti-goals/systems limits; wizard → onboarding copy
  - FAQ export + Free vs Pro answers; how-it-works Projects step; pricing/features teasers; hero onboarding
  - `config.ts` keywords — added project planning / PARA (kept annual goals)
- **Schema/API:** none
- **Plan deltas:** JSON export "Coming soon" per founder (not removed)
- **Follow-ups:** PC-03 in-app language sweep; PC-22 flip export to shipped

### PC-03 — Goal → Project language sweep (in-app)
- **Status:** ✅
- **Date:** 2026-05-21
- **Build:** `next build` clean
- **Shipped:** User-facing copy in rhythm forms, dashboard, project detail, quick-start, analytics, wrapped, recap, systems tracker, sidebar upsell, API error messages. Kept achievement name "Goal Crusher" and anti-goals entity name.
- **Follow-ups:** PC-04 LifeCategory ↔ Area copy; PC-05 daily redirect

### PC-04 — LifeCategory ↔ Area bridge copy
- **Status:** ✅
- **Date:** 2026-05-21
- **Build:** `next build` clean
- **Shipped:** Onboarding wheel + keystone steps link categories to Areas; `/areas` + area detail + AreaCard hints; `/wheel` description + editor link to Plan/Areas.
- **Follow-ups:** PC-05 daily redirect

### PC-05 — Daily surface unification
- **Status:** ✅
- **Date:** 2026-05-21
- **Build:** `next build` clean
- **Pre-flight docs read:** VISION.md, PLAN PC-05, nav-config.ts
- **Shipped:**
  - `DAILY_HOME_HREF` (`/dashboard#today`) in `nav-config.ts`
  - `TodayCard` `#today` anchor + `ScrollToTodayAnchor` on dashboard
  - `/rhythm/daily` → client redirect to Dashboard Today
  - Links updated: dashboard CTA, quick-actions, quick-capture, rhythm header/landing, systems management
  - Copy: weekly plan form, project detail systems
- **Schema/API:** none
- **Follow-ups:** PC-06 project creation & area context

### PC-06 — Project creation & area context
- **Status:** ✅
- **Date:** 2026-05-21
- **Build:** `next build` clean · quick-start + projects route tests pass
- **Pre-flight docs read:** PRODUCTION_STANDARDS §3, PLAN PC-06
- **Shipped:**
  - `POST /api/projects/quick-start` accepts optional `areaId` (ownership check; area category wins)
  - `ProjectQuickStart` — dialog + empty variants, `defaultAreaId`, cap upsell via `ProUpsellCard`
  - `/projects` — **New project** in header when list populated; Pro upsell at cap
  - `/areas/[areaId]` — **Add project in this area** with area pre-filled
  - `quick-start/route.test.ts` — 401, 402, 404 area, create with/without areaId
- **Schema/API:** quick-start body + create payload (`areaId`)
- **Follow-ups:** PC-07 tasks surface completeness

### PC-07 — Tasks surface completeness
- **Status:** ✅
- **Date:** 2026-05-21
- **Build:** `next build` clean · `tasks/route.test.ts` pass
- **Pre-flight docs read:** PLAN PC-07, tasks query bucketing, POST tasks API
- **Shipped:**
  - `/tasks` header **Add task** dialog (project picker, optional due date)
  - Inline add row on Today / This week / Backlog tabs (auto due date per bucket)
  - `tasks:lastProjectId` localStorage + primary project fallback
  - Shared `createProjectTask()` (Quick Capture reuses; persists last project)
  - Empty tab copy points to add controls
  - `projects/[projectId]/tasks/route.test.ts` — 401, 402, 201
- **Schema/API:** none (existing POST tasks)
- **Follow-ups (pre–PC-08 polish):** Task edit dialog on `/tasks` + project detail; size badges; task row links to project
- **Follow-ups:** PC-08 YearlyPlan lifecycle

### PC-08 — YearlyPlan lifecycle
- **Status:** ✅
- **Date:** 2026-05-21
- **Build:** `next build` clean · `yearly-plan/route.test.ts` pass (4 tests)
- **Pre-flight docs read:** 20-foundation.prisma, onboarding route, settings-form, planLimits.maxPlans
- **Shipped:**
  - Migration `20260521120000_yearly_plan_lifecycle` — `YearlyPlan.archivedAt`
  - `PATCH /api/yearly-plan/[planId]` — theme + reflections merge
  - `POST /api/yearly-plan/archive` — archive active plan; returns open project count
  - `POST /api/yearly-plan` — start new year (402 at `maxPlans`; 409 if active plan exists)
  - `lib/queries/yearly-plan.ts` + `lib/yearly-plan/reflections.ts`
  - Settings → **Your year** (`#your-year`): edit theme, archive, start new year dialogs
  - Dashboard: theme in header eyebrow + TodayCard; `NoActiveYearPanel` when archived (no onboarding loop)
  - Onboarding: redirects to settings if year exists but archived
- **Schema/API:** `archivedAt`; three yearly-plan routes + tests
- **Follow-ups:** PC-09 DailyState schema promotion

### PC-09 — DailyState schema promotion
- **Status:** ✅
- **Date:** 2026-05-21
- **Build:** `next build` clean · `anti-goal-held.test.ts` + `today/route.test.ts` pass (10 tests)
- **Pre-flight docs read:** 70-system.prisma, api/today, today-card JSDoc
- **Shipped:**
  - Migration `20260521140000_daily_state_anti_goal` — `antiGoalHeldId`, `antiGoalHeld`; backfill strips legacy prefix from `reflection`
  - `lib/daily-state/anti-goal-held.ts` — legacy parse + column resolve + PC-20 stats stub
  - `PATCH /api/today` accepts `antiGoalHeldId`, `antiGoalHeld` (ownership check on anti-goal)
  - `upsertDailyState()` + `getAntiGoalHeldStatsForUser()` in `lib/queries/today.ts`
  - `TodayCard` reads/writes columns; reflection no longer polluted with prefix
- **Schema/API:** `DailyState.antiGoalHeldId` FK → `AntiGoal`; extended PATCH body
- **Follow-ups:** PC-10 rhythm workspace consolidation; PC-20 analytics charts from DailyState

### PC-10 — Rhythm workspace consolidation
- **Status:** ✅
- **Date:** 2026-05-21
- **Build:** `next build` clean
- **Pre-flight docs read:** rhythm-workspace-shell, *-workspace-tabs, PRODUCTION_STANDARDS § file size
- **Shipped:**
  - `CadenceWorkspace` — single Plan/Review tab shell for weekly, monthly, quarterly
  - Deleted `weekly-workspace-tabs`, `monthly-workspace-tabs`, `quarterly-workspace-tabs`
  - `lib/rhythm/plan-form-state.ts` — shared `useCadencePlanFormState` for monthly/quarterly plan forms
  - Monthly/quarterly workspace + sidebar use `cadencePlanHasContent` (no duplicate parsers)
  - Recap header back-link → correct rhythm page per period
- **Schema/API:** none
- **Follow-ups:** PC-11 contextual hubs (Drifts · Anti-goals · Wrapped)

### PC-11 — Contextual hubs (Drifts · Anti-goals · Wrapped)
- **Status:** ✅
- **Date:** 2026-05-21
- **Build:** `next build` clean
- **Pre-flight docs read:** VISION.md dual-surface pattern, drifts/anti-goals/wrapped pages
- **Shipped:**
  - `/drifts` — header explains dashboard preview vs full inbox triage
  - Dashboard drift card — **Open full inbox →**
  - `/anti-goals` — **Focus guardrails** framing; why-both callout; Vision link; Today/review surfacing
  - Today card — **Manage all anti-goals →** + empty-state link to set guardrails
  - `/wrapped` — off-season banner (non Dec/Jan); page still browsable
  - Sidebar + mobile nav — unresolved drift count badge on Drift inbox
- **Schema/API:** none
- **Follow-ups:** PC-12 project detail progressive disclosure

### PC-12 — Project detail progressive disclosure
- **Status:** ✅
- **Date:** 2026-05-21
- **Build:** `next build` clean
- **Pre-flight docs read:** PLAN.md PC-12, project-detail-view, page-container widths
- **Shipped:**
  - `/projects/[projectId]` — `PageContainer width="wide"` (matches `/projects`, dashboard)
  - Default visible: header, tasks, systems, motivation (side-by-side on lg)
  - Collapsed accordions: key results, checkpoints (+ weekly progress), notes, resources, anti-goals context
  - Section counts + empty hints on collapsed triggers
  - `ProjectDetailSection` collapsible wrapper; `embedded` mode on KR/checkpoints/timeline
  - Motivation always shown with empty-state hint to use Edit details
  - Unified `rounded-2xl` section shells across tasks/systems/motivation
- **Schema/API:** none
- **Follow-ups:** PC-13 focus signals

### PC-13 — Focus signals & priority context
- **Status:** ✅
- **Date:** 2026-05-21
- **Build:** `next build` clean · `weekly-priorities.test.ts` 3/3
- **Pre-flight docs read:** PLAN.md PC-13, weekly-plan-form, weekly-workspace, tasks-board
- **Shipped:**
  - `getWeeklyPriorityProjectIds` + `getWeeklyPriorityProjects` in `lib/queries/weekly-priorities.ts`
  - Dashboard Today card — **Week N priorities** chips (max 3) + Edit plan link
  - Stats card nudge — e.g. `6 active · 3 prioritized this week`
  - `/projects` — **This week** badge + amber accent on prioritized cards
  - `/tasks` — amber left border + badge on tasks from priority projects
  - Projects overview on dashboard — priority ring + badge
  - `getWeeklyFocusGoals` delegates to shared helper (systems/today API unchanged)
- **Schema/API:** none
- **Follow-ups:** PC-14 onboarding guided path

### PC-14 — Onboarding → week-1 guided path
- **Status:** ✅
- **Date:** 2026-05-21
- **Build:** `next build` clean · `user-preferences.test.ts` 4/4
- **Pre-flight docs read:** PLAN.md PC-14, onboarding-wizard, dashboard page
- **Shipped:**
  - `User.preferences` JSON + migration `20260521180000_user_preferences`
  - Dashboard **Your first week** checklist (5 steps, auto-complete from server data)
  - Dismiss persists via `PATCH /api/user/me` (`dismissWeekOneChecklist`)
  - Capture step opens ⌘K quick capture; vision visit tracked on `/vision`
  - Onboarding finish toast: **Start with Today — everything else waits**
  - Progress bar + project count hint (`1/3 projects`)
- **Schema/API:** `User.preferences`; extend `PATCH /api/user/me`
- **Follow-ups:** PC-15 global search · run `npm run db:migrate`

### PC-15 — Global search
- **Status:** ✅
- **Date:** 2026-05-21
- **Build:** `next build` clean · search tests 6/6
- **Pre-flight docs read:** PLAN.md PC-15, quick-capture cmdk, PRODUCTION_STANDARDS caps
- **Shipped:**
  - `GET /api/search?q=&limit=20` — projects, tasks, notes, drifts (inbox), areas
  - `lib/queries/search.ts` — tenant-scoped `contains` insensitive; empty q → recent projects
  - Note results include parent breadcrumb + navigate to parent surface
  - Topbar **Search** button + `/` keyboard shortcut → cmdk search dialog
  - Debounced server search; quick actions when query empty
  - Rate limit 30 req/min per user when Upstash configured (`rate-limit-search.ts`)
- **Schema/API:** `/api/search`; CommandDialog `shouldFilter` + controlled value
- **Follow-ups:** PC-16 knowledge index pages

---

### PC-16 — Knowledge index pages
- **Status:** ✅
- **Date:** 2026-05-21
- **Build:** clean · `vitest` knowledge-index + route tests
- **Pre-flight docs read:** PLAN.md PC-16, PARA.md § Notes, notes-block.tsx
- **Shipped:**
  - `/knowledge/notes` + `/knowledge/resources` browse-only index pages
  - `/notes` redirect alias → `/knowledge/notes`
  - `listNotesForUser` / `listResourcesForUser` with cursor pagination (max 50/page)
  - Filters: parent type, area; inline edit/delete (notes + link resources)
  - Note click → parent detail with `#note-{id}` anchor + scroll-mt on NotesBlock rows
  - Settings **Knowledge** section links; DECISIONS: defer sidebar nav until user testing
  - `GET /api/knowledge/notes` + `/resources` for Load more
- **Schema/API:** no migration; parent-context + knowledge-index queries
- **Follow-ups:** PC-17 discoverability polish (View all links, Quick Capture)

---

### PC-17 — Note & resource discoverability polish
- **Status:** ✅
- **Date:** 2026-05-21
- **Build:** clean · index-links tests
- **Pre-flight docs read:** PLAN.md PC-17, vision page, ParentType enum
- **Shipped:**
  - Vision page: `<ResourcesBlock parentType="VISION">` (enum already supported — no migration)
  - Area/project detail: "View all N notes/resources" when count > 3 → filtered knowledge index
  - `lib/knowledge/index-links.ts` — href builders + threshold constant
  - NotesBlock/ResourcesBlock empty states link to knowledge indexes
  - Quick Capture: "Search notes…" action; browse all notes/resources in search quick actions + palette Pages
- **Schema/API:** none
- **Follow-ups:** PC-18 Vision ↔ Project linking

---

### PC-18 — Vision ↔ Project linking
- **Status:** ✅
- **Date:** 2026-05-21
- **Build:** clean · vision-projects + route tests
- **Pre-flight docs read:** PLAN.md PC-18, 30-projects.prisma, vision items API
- **Shipped:**
  - Migration `20260521190000_project_vision_link` — `Project.visionItemId` FK → `VisionItem` (ON DELETE SET NULL)
  - Project detail **Serves vision** dropdown (`ProjectVisionLink`)
  - Vision cards show linked active-project count + chips → `/projects/[id]`
  - Dashboard foundation strip when milestones have linked projects
  - `PUT /api/projects/[id]` accepts `visionItemId` (nullable)
- **Schema/API:** migration required — run `npm run db:migrate`
- **Follow-ups:** PC-19 Area health rollup

---

### PC-19 — Area health rollup
- **Status:** ✅
- **Date:** 2026-05-21
- **Build:** clean · area-health.test.ts
- **Pre-flight docs read:** PLAN.md PC-19, areas.ts, wheel snapshots
- **Shipped:**
  - `area-health.ts` — transparent composite (50% project pulse, 35% weekly rhythm, 15% wheel momentum)
  - `getAreasForUser` returns `health` per area (`quiet` / `green` / `amber`)
  - `/areas` grid: subtle health indicator on each card (no red gamification)
  - Dashboard **Areas pulse** row — dot per area → `/areas`
- **Schema/API:** none
- **Follow-ups:** PC-20 Analytics ↔ rhythm loop

---

### PC-20 — Analytics ↔ rhythm loop
- **Status:** ✅
- **Date:** 2026-05-21
- **Build:** clean · daily-state-trend.test.ts
- **Pre-flight docs read:** PLAN.md PC-20, analytics page, DailyState schema
- **Shipped:**
  - 30-day DailyState mood + energy dual line chart (renders at ≥7 logged days)
  - Empty/sparse analytics CTA → `/rhythm/weekly?tab=review`
  - Stats row: check-in streak, systems today, systems consistency (7-day avg)
  - 12-week review consistency chart from rhythm stats
  - `lib/analytics/daily-state-trend.ts` — series builder + min-day threshold
- **Schema/API:** none · ProGate unchanged
- **Follow-ups:** PC-22 JSON export & data portability

---

### PC-21 — Notifications & email cadence
- **Status:** ✅
- **Date:** 2026-05-21
- **Build:** clean · user-preferences.test.ts · email-eligibility.test.ts · weekly-reminder route test
- **Pre-flight docs read:** PLAN.md PC-21, settings-form.tsx, MVP_LAUNCH crons, existing email routes
- **Shipped:**
  - `User.preferences.emailPreferences` — weekly, monthly, quarterly, daily toggles (default on)
  - `PATCH /api/user/me` + GET returns resolved `emailPreferences`
  - Settings `#notifications` — working toggles replace dashed placeholder
  - Crons respect opt-out: weekly-reminder, daily-nudge, quarterly-nudge
  - New `monthly-nudge` cron + email template (Pro, no review yet this month)
  - `EmailPreferencesFooter` in all reminder emails → `/settings#notifications`
  - `vercel.json` — weekly Friday 18:00 UTC; monthly 1st 09:00 UTC
- **Schema/API:** no migration — preferences JSON only
- **Follow-ups:** PC-22 JSON export & data portability

---

### PC-22 — JSON export & data portability
- **Status:** ✅
- **Date:** 2026-05-21
- **Build:** clean · user-export.test.ts · export route test
- **Pre-flight docs read:** PLAN.md PC-22, marketing-plan-copy, PRODUCTION_STANDARDS, settings delete flow
- **Shipped:**
  - `GET /api/export` — JSON bundle (user, plans, areas, projects, tasks, systems+completions, notes, resources metadata, drifts, check-ins, wheel, vision, anti-goals, dailyStates, rhythm plans/reviews, streaks, achievements, reviewTemplates)
  - Rate limit 1/hour (`rate-limit-export.ts`) when Upstash configured
  - 10k row cap with 413 response
  - Settings **Export your data** → `yearinreview-export-YYYY-MM-DD.json`
  - Delete flow reminds user to export first
  - Marketing/FAQ/pricing compare updated — export shipped for Free + Pro
- **Schema/API:** none
- **Follow-ups:** PC-23 Mobile & responsive polish

---

### PC-23 — Mobile & responsive polish
- **Status:** ✅
- **Date:** 2026-05-21
- **Build:** clean
- **Pre-flight docs read:** PLAN.md PC-23, MVP_LAUNCH mobile spot-check, mobile-nav, rhythm workspaces
- **Shipped:**
  - **TodayCard** — 44px mood/energy pills (wrap), anti-goal row stacks on narrow screens, larger system tap targets
  - **Rhythm workspaces** — sidebar stacks **below** main on `<lg` (default `sidebarFirstOnMobile=false`); cadence tabs min-h-11
  - **Weekly review** — sticky submit bar on mobile with safe-area padding
  - **Week navigator** — 44px prev/next controls
  - **Tasks board** — single-column rows on mobile; bucket tabs wrap; larger checkbox/menu targets
  - **Drifts board** — action bar always visible on mobile (hover-only on desktop); bottom-sheet process dialog
  - **Project detail** — accordion triggers min-h-11; hint visible on mobile
  - **App shell** — `overflow-x-hidden` + `min-w-0` on main to prevent iPhone SE horizontal scroll
- **Schema/API:** none
- **Follow-ups:** PC-24 Launch QA & ops completion

---

### PC-24 — Launch QA & ops completion
- **Status:** ✅
- **Date:** 2026-05-21
- **Build:** clean · api-auth-audit.test.ts · e2e smoke extended
- **Pre-flight docs read:** PLAN.md PC-24, MVP_LAUNCH.md, DEPLOYMENT.md, e2e/smoke.spec.ts
- **Shipped:**
  - **Auth audit** — `api-auth-audit.test.ts` verifies every `api/**/route.ts` has session or secret guard
  - **OG image** — `src/app/opengraph-image.tsx` (1200×630)
  - **E2E** — smoke: marketing truth, auth gates, API 401; optional `authenticated.spec.ts` for local full path
  - **Docs** — `MVP_LAUNCH.md` refreshed (2026-05-21); `DEPLOYMENT.md` cron schedule; `CHANGELOG.md` **v1.0.0**; `TESTING.md` updated
  - **Marketing grep** — no false export/unlimited claims on pricing/FAQ (automated in e2e)
- **Schema/API:** none
- **Deploy-time P0** (founder): production env, payments E2E, email deliverability, domain SSL, Lighthouse manual pass
- **Follow-ups:** Production cutover per MVP_LAUNCH P0 checklist

---

## Phase log template

<!--
### PC-XX — <name>
- **Status:** ✅
- **Date:** YYYY-MM-DD
- **Build:** `next build` / `tsc` / tests
- **Pre-flight docs read:** list
- **Shipped:**
- **Schema/API:**
- **Plan deltas:**
- **Follow-ups:**
-->
