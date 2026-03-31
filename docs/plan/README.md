# Execution Plan Workspace

This folder is the single source of truth for shipping the platform step by step without losing context.

## Files and purpose

- `ROADMAP.md`: long-horizon phases and outcomes.
- `NEXT_SPRINT.md`: only active tasks for the current sprint.
- `DECISIONS.md`: key product/engineering decisions and rationale.
- `CHANGELOG_EXECUTION.md`: dated progress log of completed work.
- `RISKS.md`: active risks, impacts, and mitigations.

## Working agreement

1. Keep `NEXT_SPRINT.md` small and actionable.
2. Move completed items from `NEXT_SPRINT.md` to `CHANGELOG_EXECUTION.md`.
3. Record any scope change in `DECISIONS.md` before implementation.
4. Update `RISKS.md` whenever a blocker appears or is resolved.

## Definition of done for each task

- Code implemented.
- Verified locally (or verification gap explicitly noted).
- Execution log updated in `CHANGELOG_EXECUTION.md`.
- Follow-up tasks (if any) added to `NEXT_SPRINT.md`.
