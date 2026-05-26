> **Archived 2026-05-21** — execution history. See [`CHANGELOG.md`](../../CHANGELOG.md) and [`plan/DECISIONS.md`](../plan/DECISIONS.md) for outcomes.

# Product Completeness — Execution Track

**Status:** Complete (PC-01–PC-24 ✅, 2026-05-21) — **v1.0 feature-complete in code**; production cutover via [`MVP_LAUNCH.md`](../plan/MVP_LAUNCH.md) P0

## How this relates to other docs

| Doc | Role |
|-----|------|
| [`VISION.md`](./VISION.md) | **Locked product IA** — dual-surface pattern, scope lock (PC-01) |
| [`PLAN.md`](./PLAN.md) | **Master phase plan** — 24 phases in 8 waves |
| [`PROGRESS.md`](./PROGRESS.md) | Mutable tracker — update after each phase |
| [`../dashboard-improvisation/PLAN.md`](../dashboard-improvisation/PLAN.md) | PARA rebuild (Phases 0–14 ✅) |
| [`../dashboard-improvisation/PARA.md`](../dashboard-improvisation/PARA.md) | Entity mapping & vision |
| [`../PRODUCTION_STANDARDS.md`](../PRODUCTION_STANDARDS.md) | **Required** before every phase |
| [`../plan/MVP_LAUNCH.md`](../plan/MVP_LAUNCH.md) | Ops / env / payments (Wave 8) |
| [`../plan/DECISIONS.md`](../plan/DECISIONS.md) | Log consequential scope changes |
| [`.cursor/rules/`](../../.cursor/rules/) | Coding conventions per layer |

## Core principle: simplicity ≠ fewer features

The sidebar stays **Today · Plan · Reflect · Foundation** with **11 destinations**. Simplicity comes from:

1. **One vocabulary** — Projects, not Goals; one daily home; consistent rhythm copy  
2. **Contextual surfacing** — same data, right surface (Dashboard preview vs full `/drifts` page)  
3. **Progressive disclosure** — power features (template editor, KRs, checkpoints) collapsed until needed  
4. **Honest marketing** — claims match `planLimits` and shipped UI  
5. **Closed loops** — every nav item supports full CRUD; compass connects to execution  

## Execution rules (from dashboard improvisation + production standards)

- **One PR per phase**, squash-merge to `main`
- **Branch:** `pc-XX-short-name` (product-completeness phase number)
- **Before coding:** read the phase's **Pre-flight** checklist in `PLAN.md`
- **After coding:** run **Post-flight** checklist; update `PROGRESS.md`
- **Migrations:** at most one per phase; name `YYYYMMDD_purpose`
- **No scope creep:** ideas outside the phase → parking lot in `PROGRESS.md`

## Wave overview

| Wave | Phases | Theme | Outcome |
|------|--------|-------|---------|
| **A** | PC-01 – PC-02 | Governance & truth | Decisions reconciled; marketing honest |
| **B** | PC-03 – PC-05 | Language & IA clarity | One mental model; no terminology drift |
| **C** | PC-06 – PC-10 | CRUD & plan lifecycle | Nothing "half-built" for daily use |
| **D** | PC-11 – PC-14 | Simplicity layer | Full feature set, calmer surfaces |
| **E** | PC-15 – PC-17 | Knowledge & search | Notes/resources usable at scale |
| **F** | PC-18 – PC-20 | Compass ↔ execution | Vision, areas, priorities connected |
| **G** | PC-21 – PC-22 | Retention & portability | Reminders, export, streak narrative |
| **H** | PC-23 – PC-24 | Ship readiness | Mobile, QA, ops checklist |

**Estimated calendar:** ~6–10 weeks at ~2–3 phases/week (some phases are copy-only; others touch schema).

When Wave H is complete, the product is **feature-complete for v1.0** per the PARA vision + user review gaps.
