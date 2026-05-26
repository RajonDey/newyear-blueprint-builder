# Testing

## Commands

| Script | What it runs |
|--------|----------------|
| `npm run test` | Vitest — API route unit tests (`src/**/*.test.ts`) |
| `npm run test:e2e` | Playwright — smoke tests in `e2e/` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint via Next.js |

## API tests (Vitest)

Tests invoke route handlers directly with mocked `auth()` and `db`. No database required.

Coverage today:

- `POST /api/notes` — 401, 404 parent, 402 quota, 201 create
- `PATCH /api/tasks/[taskId]` — 401, 404 tenant
- `GET` + `POST /api/check-ins/weekly` — 401, 404 plan, 200 update, 201 create
- `GET` + `POST /api/projects` — 401, paginated GET, 402 project limit, 201 create
- `src/lib/api-route.test.ts` — pagination + Prisma error helpers
- `src/lib/api-auth-audit.test.ts` — every `api/**/route.ts` has session or secret guard

Add new tests when shipping API routes — follow `src/app/api/notes/route.test.ts`.

## E2E smoke (Playwright)

**CI (default):** Marketing pages load; pricing/FAQ truth checks; `/dashboard`, `/rhythm/weekly`, `/settings`, `/projects`, `/onboarding` redirect to `/login`; unauthenticated `/api/export`, `/api/search`, `/api/onboarding`, and cron routes return 401. No OAuth or DB needed.

**Local authenticated path (optional):**

```bash
# 1. Save session after manual sign-in
npx playwright codegen --save-storage=e2e/.auth/user.json http://localhost:3000/login

# 2. Run authenticated spec
E2E_STORAGE_STATE=e2e/.auth/user.json npm run test:e2e -- e2e/authenticated.spec.ts
```

Covers: dashboard → weekly review tab → settings export button → authenticated export API.

**Local full smoke** (optional):

```bash
npm run build
npm run start   # terminal 1
npm run test:e2e  # terminal 2 — uses existing server if not CI
```

## CI

GitHub Actions workflow: `.github/workflows/ci.yml`

- Job `quality`: typecheck → lint → vitest → build
- Job `e2e`: build → Playwright smoke (after quality passes)
