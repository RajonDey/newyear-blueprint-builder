# Production Standards — YearInReview

> **Audience:** Humans and AI agents building or changing this codebase.  
> **Purpose:** Prevent recurring mistakes found in the May 2026 production-readiness review.  
> **Authority:** When this doc conflicts with old code, **follow this doc** for new work. Legacy code may violate these rules until migrated.

**Related docs:** [`ARCHITECTURE.md`](./ARCHITECTURE.md) · [`plan/MVP_LAUNCH.md`](./plan/MVP_LAUNCH.md) · [`.cursor/rules/`](../.cursor/rules/)

---

## Quick checklist (every PR / feature)

Before marking work done, verify:

- [ ] **Reads** use `lib/queries/*` in RSC pages — not client `fetch` on mount unless there is a documented exception.
- [ ] **Writes** use API routes or Server Actions with `auth()`, Zod, and tenant checks.
- [ ] **No new file** over ~300 lines without splitting or a comment explaining why.
- [ ] **List GETs** paginate or cap payload size when returning collections.
- [ ] **Plan limits** use `planLimits[tier].maxProjects` (not deprecated `maxGoalsPerPlan`) and return **402** with `{ error, message?, upgradeUrl }`.
- [ ] **Cross-tenant IDs** return **404**, not 403.
- [ ] **Unique constraints** handled (upsert or **409**), not unhandled Prisma `P2002` → 500.
- [ ] **JSON body** parsed with `.catch(() => null)` before Zod.
- [ ] **Polymorphic parents** validated via `assertParentBelongsToUser`.
- [ ] **No `any`** / `as never` without a one-line justification.
- [ ] **No deleted API paths** — grep for route existence before adding `fetch`.
- [ ] **Types** exported from `src/types/` when shared across page + component + API.

---

## 1. Architecture principles

### 1.1 Data flow (required)

```
Page (RSC)  →  requireAuth()  →  lib/queries/<surface>.ts  →  Prisma
                    ↓
            Thin client component (UI + events only)
                    ↓
            fetch /api/... OR Server Action  →  route.ts  →  Prisma
```

| Layer | Responsibility |
|-------|----------------|
| `src/app/(app)/**/page.tsx` | Auth, load data, compose layout. **No business logic.** |
| `src/lib/queries/**` | All read aggregations for a surface. One file per page/feature area. |
| `src/app/api/**/route.ts` | Auth, validation, writes, quotas. Delegate heavy reads to queries when reused. |
| `src/components/**` | Presentation, local UI state, user events. **Not** primary data loading. |

**Do not add:** React Query, Zustand, or global client stores unless `providers.tsx` is explicitly updated with a written rationale.

### 1.2 New feature workflow

1. **Schema** — Add/change models in the correct `prisma/schema/*.prisma` file; create a migration (`npm run db:migrate`).
2. **Query** — Add `getXForUser(userId)` in `src/lib/queries/<feature>.ts`.
3. **Page** — Server component: `requireAuth()` + query + pass serializable props to client UI.
4. **API** — Only for mutations (or shared reads used by client islands). Follow [§3](#3-api-routes).
5. **Component** — Default Server Component; `"use client"` only when needed.
6. **Tests** — At minimum: one test for auth rejection and one for happy-path or quota (see [§8](#8-testing)).

---

## 2. Pages & server components

### 2.1 Page rules

- Use `requireAuth()` from `@/lib/auth-guard` on every `(app)/` page.
- Use `<PageContainer>` + `<PageHeader>` from `@/components/shared/*` for new pages.
- Pass **narrow, typed props** to client children — not full Prisma graphs cast with `as never`.
- Use `<Suspense>` + skeleton fallbacks for slow child islands (see rhythm weekly/monthly/quarterly).

### 2.2 Forbidden page patterns

| Anti-pattern | Why | Instead |
|--------------|-----|---------|
| `"use client"` on `page.tsx` | Loses RSC benefits | Keep page as RSC; extract client leaf |
| Client `useEffect` + `fetch('/api/...')` for primary content | Waterfall, no SSR, duplicates queries | Prefetch in page via `lib/queries` |
| Business logic in `page.tsx` (> ~80 lines) | Hard to test | Move to `lib/queries` or `lib/<domain>.ts` |
| Duplicate fetch of same data (e.g. dashboard + daily page) | Waste + drift | Single query module; pass props |

### 2.3 Allowed client-fetch exceptions

Document in the PR if you must client-fetch on mount:

- Real-time polling (not used today).
- User-triggered refresh after mutation where `router.refresh()` is insufficient.
- Admin-only tools with no SEO need.

Even then, prefer `router.refresh()` after mutations so the RSC tree reloads.

---

## 3. API routes

Canonical examples: `src/app/api/notes/route.ts`, `src/app/api/areas/route.ts`, `src/app/api/drifts/route.ts`.

### 3.1 Authentication & tenancy

```ts
const session = await auth()
if (!session?.user?.id) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}
```

- **Every** user-facing handler calls `auth()` — middleware does **not** protect `/api/*`.
- Before `update`/`delete` by id alone, **pre-fetch** with `userId` or `plan: { userId }` in the `where` clause.
- Wrong user's resource → **404** `"Not found"` (avoid 403 — reduces ID enumeration).

### 3.2 Request parsing & validation

```ts
const body = await req.json().catch(() => null)
const parsed = createThingSchema.safeParse(body)
if (!parsed.success) {
  return NextResponse.json(
    { error: "Invalid input", details: parsed.error.flatten() },
    { status: 400 },
  )
}
```

- Zod schema named `{action}{Entity}Schema` (e.g. `createNoteSchema`, `updateProjectSchema`).
- Validate query params with Zod or explicit bounds (`limit` max 100, default 20).

### 3.3 Response envelope (consistent)

| Case | Status | Body |
|------|--------|------|
| Success (one) | 200 / 201 | `{ data: T }` |
| Success (list) | 200 | `{ data: T[], pagination?: { page, limit, total, totalPages } }` |
| Validation | 400 | `{ error: "Invalid input", details?: … }` |
| Unauthorized | 401 | `{ error: "Unauthorized" }` |
| Payment / quota | 402 | `{ error: "THING_LIMIT", message: string, upgradeUrl: "/pricing" }` |
| Not found / wrong tenant | 404 | `{ error: "Not found" }` |
| Conflict (duplicate) | 409 | `{ error: "Already exists", message?: string }` |
| Server failure | 500 | `{ error: "Internal error" }` — log details server-side only |

### 3.4 Plan tier limits

- Source of truth: `planLimits` in `@/lib/config`.
- Use **current** keys: `maxProjects`, `maxTasksPerProject`, `maxSystemsPerProject`, `maxAreas`, `maxNotes`, `maxResources` — **never** `maxGoalsPerPlan` in new code.
- Check count **before** insert; return **402** (not 403) with `upgradeUrl`.
- Pro-only features: `hasProProductAccess(planTier, role)` from `@/lib/plan-access`.

### 3.5 List endpoints & pagination

All `GET` handlers that return **collections** must:

- Accept `?page=1&limit=20` (default `limit=20`, max `100`).
- Return `pagination: { page, limit, total, totalPages }`.
- Use `select` or minimal `include` — **never** return full nested graphs for list views.

```ts
// List view — minimal
const projects = await db.project.findMany({
  where: { planId: plan.id },
  select: { id: true, title: true, status: true, areaId: true, updatedAt: true },
  skip: (page - 1) * limit,
  take: limit,
})
```

Detail views (`GET /api/projects/[id]`) may include more relations; list views may not.

### 3.6 Idempotency & Prisma errors

| Constraint | Pattern |
|------------|---------|
| Unique per period (weekly check-in) | `upsert` or catch `P2002` → **409** |
| Create-or-update review/plan | `upsert` on `@@unique` composite |
| Multi-step writes | `db.$transaction(async (tx) => { … })` |

Wrap handlers that touch unique indexes:

```ts
try {
  // create / upsert
} catch (e) {
  if (isPrismaUniqueViolation(e)) {
    return NextResponse.json({ error: "Already exists" }, { status: 409 })
  }
  throw e
}
```

Use `handleApiRoute()` and helpers from `@/lib/api-route`.

### 3.7 PARA naming in handlers

- DB: `db.project`, `db.task`, `db.system`, `db.projectCheckIn`, etc.
- App and API routes use `/projects` and `/api/projects/[projectId]`; `next.config.ts` redirects legacy `/goals` URLs.
- Query module: `@/lib/queries/projects` (thin re-export in `goals.ts` for any stragglers).

### 3.8 Side effects

- Achievements, streaks, email: keep in route or extract to `lib/<domain>-side-effects.ts` — not scattered in components.
- File upload: write DB row and blob in an order that allows compensation, or document accepted orphan risk.

### 3.9 Polymorphic notes & resources

Always:

```ts
const ok = await assertParentBelongsToUser(userId, parentType, parentId)
if (!ok) return NextResponse.json({ error: "Parent not found" }, { status: 404 })
```

Notes API: `POST /api/notes` with `{ parentType, parentId, content }` — **not** `/api/goals/[id]/notes` (removed).

---

## 4. Components

### 4.1 Size & structure

| Guideline | Limit |
|-----------|-------|
| Client component file | **≤ 300 lines** target; split at 400 |
| `fetch` calls per component | ≤ 3 — extract hook or server action |
| Responsibilities per file | One: list, form, dialog, or section — not all |

Split pattern for detail pages (e.g. project detail):

```
project-detail-view.tsx      — layout + tabs only
project-detail-header.tsx    — title, status, area
project-tasks-section.tsx
project-systems-section.tsx
project-key-results-section.tsx
```

### 4.2 Client mutations

Prefer this pattern (or shared helper when added):

```ts
const res = await fetch("/api/notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
const body = await res.json().catch(() => null)
if (!res.ok) {
  toast.error(body?.message ?? body?.error ?? "Something went wrong")
  return
}
toast.success("Saved")
startTransition(() => router.refresh())
```

- Always check `res.ok`.
- Never swallow errors silently (empty catch without user feedback).
- After success, `router.refresh()` to reconcile RSC data.

### 4.3 UI consistency

- Loading: `@/components/ui/skeleton` or `SkeletonCard` from shared — don't duplicate inline skeletons unless one-off.
- Empty: `<EmptyState>` from `@/components/shared/empty-state`.
- Pro: `<ProGate>` — never hide Pro features entirely.
- Rich text display: `sanitizeRichTextHtml()` before `dangerouslySetInnerHTML`.

### 4.4 Cadence features (weekly / monthly / quarterly)

When adding rhythm/cadence UI:

1. Reuse `lib/cadence-plan-utils.ts`, `lib/review-templates.ts`, `lib/rhythm-defaults.ts`.
2. Reuse workspace **slot** pattern from `weekly-workspace-tabs.tsx` — don't copy-paste a fourth full workspace shell.
3. Plan API: one shared upsert helper for monthly/quarterly — don't duplicate route bodies.

---

## 5. Database & Prisma

### 5.1 Schema changes

- Edit the correct file under `prisma/schema/` (see `.cursor/rules/database.mdc`).
- Always create a migration — never rely on `db push` for production.
- Add `@@index` on foreign keys used in `where` (`planId`, `projectId`, `userId`).

### 5.2 Queries

- No raw SQL unless approved in PR.
- Avoid N+1: use `include` / `select` thoughtfully, or batched `findMany({ id: { in: ids } })`.
- Heavy analytics: aggregate in SQL or cap time range — don't load all `weeklyCheckIns` for all time without bounds.

### 5.3 Migrations (production)

- Run `npm run db:deploy` on staging clone first.
- Read `docs/DEPLOYMENT.md` if P3005 appears.
- Destructive migrations require explicit backup note in PR.

---

## 6. Security & configuration

| Rule | Detail |
|------|--------|
| Secrets | Server-only env vars — never `NEXT_PUBLIC_*` for secrets |
| Middleware | Must **not** pass through when `NEXTAUTH_SECRET` is missing (fail closed) |
| Auth beta | `next-auth@5` beta — pin version; test auth flows before release |
| Rate limit | Auth routes use Upstash; consider limits on expensive GETs if abused |
| Webhooks | Verify signature before DB; handle `timingSafeEqual` length mismatch safely |
| Cron | `Authorization: Bearer ${CRON_SECRET}` |
| HTML | Sanitize all user HTML before render |

---

## 7. Naming & file placement

Follow `.cursor/rules/naming.mdc`. Summary:

| Concept | Code name | Avoid |
|---------|-----------|-------|
| Goal | **Project** | `goal` in new variables (except URL param aliases) |
| Action | **Task** | `action` for tasks |
| API list key | `maxProjects` | `maxGoalsPerPlan` |
| Zod | `createProjectSchema` | `createSchema` on shared routes (be specific) |

**New files:**

| Type | Location |
|------|----------|
| Page | `src/app/(app)/<route>/page.tsx` |
| Query | `src/lib/queries/<surface>.ts` |
| API | `src/app/api/<kebab-resource>/route.ts` |
| UI | `src/components/<domain>/` |
| Shared types | `src/types/<domain>.ts` |
| Domain logic | `src/lib/<domain>.ts` |

---

## 8. Testing

**Required for new features** (minimum):

1. **API:** Unauthorized → 401; wrong `userId` → 404; over quota → 402.
2. **Critical paths:** Extend `e2e/smoke.spec.ts` or add Vitest coverage for new routes.

See **`docs/TESTING.md`** for commands and patterns. Copy `src/app/api/notes/route.test.ts` when adding API routes.

**CI (active):** `.github/workflows/ci.yml` runs `typecheck` → `lint` → `test` → `build`, then Playwright smoke.

---

## 9. Known anti-patterns (do not replicate)

These exist in legacy code — **do not copy**:

1. **God components** — `quick-capture-button.tsx`, `today-card.tsx` (project detail was split in Phase D).
2. **Deleted routes** — `POST /api/goals/[id]/notes` (use `/api/notes`).
3. **`maxGoalsPerPlan` + 403** on project create — use `maxProjects` + 402.
4. **Weekly check-in `create` only** — duplicates throw 500; use upsert/409.
5. **Unpaginated list GET** with full task/system/checkpoint includes.
6. **Client-fetch primary page data** — analytics, wrapped, settings profile (migrate to RSC).
7. **`as never` / `any` on auth** — extend NextAuth types in `src/types/`.
8. **403 on cross-tenant** anti-goal access — use 404.
9. **Duplicate cadence route bodies** — monthly vs quarterly plan routes.
10. **Inline fetch + toast + refresh** copy-pasted 30× — extract shared helper when touching 3+ sites.

---

## 10. Reference implementations

Copy patterns from these files:

| Pattern | File |
|---------|------|
| API helpers | `src/lib/api-route.ts` |
| Client mutations | `src/lib/api-fetch.ts` |
| Cadence plan upsert | `src/lib/cadence-plan-upsert.ts` |
| API create + quota + polymorphic parent | `src/app/api/notes/route.ts` |
| RSC prefetch | `src/app/(app)/analytics/page.tsx` |
| Project detail sections | `src/components/projects/project-detail-*.tsx` |
| App error boundary | `src/app/(app)/error.tsx` |

---

## 11. Pre-launch remediation phases

Tracked from code review — not blocking every feature, but prioritize:

| Phase | Focus |
|-------|--------|
| **A** | ~~Bug fixes: completion notes API, weekly check-in idempotency, middleware fail-closed, migration dry-run~~ **Done** |
| **B** | ~~CI + API tests + smoke E2E~~ **Done** — see `docs/TESTING.md` |
| **C** | ~~API helpers, pagination, error envelope~~ **Done** |
| **D** | ~~Split god components, cadence DRY, RSC prefetch, indexes~~ **Done** |
| **E** | ~~Phase 7 rename (`goals` → `projects` URLs)~~ **Done** |

When implementing Phase A+, update this doc if new helpers (`apiFetch`, `requireApiSession`) land — link them in §3 and §4.

---

## Changelog

| Date | Change |
|------|--------|
| 2026-05-20 | Initial version from production-readiness review |
| 2026-05-20 | Phase A shipped: completion notes API, weekly check-in upsert, middleware fail-closed |
| 2026-05-20 | Phase B shipped: Vitest API tests, Playwright smoke, CI workflow, `typecheck` script |
| 2026-05-20 | Phase C shipped: `lib/api-route.ts`, goals pagination + 402, upload compensation, webhook fix |
| 2026-05-20 | Phase D shipped: goal detail split, `api-fetch`, cadence upsert lib, RSC prefetch, indexes, `(app)/error.tsx` |
