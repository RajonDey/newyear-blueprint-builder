> **Archived 2026-05-21** — execution history. See [`CHANGELOG.md`](../../CHANGELOG.md) and [`plan/DECISIONS.md`](../plan/DECISIONS.md) for outcomes.

# Dashboard Improvisation

A focused workstream to bring NBB's dashboard (the authenticated `(app)` surfaces)
up to the visual & UX bar set by the YIR / Lovable design study, **without**
regressing any production functionality.

## What lives here

| File | Purpose | Mutability |
|---|---|---|
| [`PLAN.md`](./PLAN.md) | The master plan — phases, scope, conventions, gating, risks. | **Stable** — only edit if scope changes. |
| [`PROGRESS.md`](./PROGRESS.md) | Phase-by-phase tracker. Status, dates, PR links, follow-ups. | **Mutable** — update after every phase. |
| [`PARA.md`](./PARA.md) | How NBB's entities map onto Tiago Forte's PARA / Second Brain — the design philosophy behind YIR (Lovable). | **Stable** — reference doc. |

## Quick links

- Marketing improvisation (already shipped): see homepage, `/how-it-works`, `/pricing`, `/faq`, `/about`, and the redesigned footer in `src/app/(marketing)/`.
- Pricing source of truth: `src/lib/config.ts` → `planLimits`.
- Pro gating helper: `src/lib/plan-access.ts`.

## How to work this plan

1. Pick the **next phase** from `PROGRESS.md` (always sequential — `Phase 0 → 1 → 2 → …`).
2. Read its section in `PLAN.md`.
3. Execute the phase in one focused session.
4. Update `PROGRESS.md` with status, build result, follow-ups.
5. If scope changes mid-phase, update `PLAN.md` **and** note it in `PROGRESS.md` under "Plan deltas".

## Hard rules (apply to every phase)

1. **Additive only.** No destructive Prisma migrations. No env var changes. No middleware/auth edits unless explicitly required and explicitly approved.
2. **NBB is the production system.** YIR is design reference only — never the implementation source.
3. **Anything YIR shows that NBB doesn't build** (Echo AI, Drift notes, Areas/Projects/Tasks model) is documented in `PLAN.md` and **not** shipped.
4. **One phase = one shippable state.** `next build` must pass cleanly at the end of every phase.
5. **Reusable, typed, modular.** New components live in a clear domain folder; primitives live in `components/atmosphere/` or `components/shared/`.
