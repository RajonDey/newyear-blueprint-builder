# Product Execution Roadmap

Owner: Platform team  
Last updated: 2026-03-30

## Phase 1 - Correctness and Safety (Current)

Goal: remove high-risk issues before feature expansion.

- Add ownership guard to weekly check-in creation API.
- Add rich-text sanitization policy and implementation.
- Unify week and timezone logic across weekly/daily flows.
- Validate behavior with focused regression checks.

Exit criteria:

- No unsafe write paths for cross-user plan access.
- No unsanitized HTML rendering path.
- Consistent week boundaries for user-facing planning and review.

## Phase 2 - Information Architecture and Clarity

Goal: reduce navigation confusion and align product language.

- Simplify app IA into: `Plan`, `Execute`, `Review`, `Settings`.
- Align labels across sidebar, mobile nav, headers, and marketing.
- Rework dashboard quick actions around "next best action."

Exit criteria:

- New user can identify where to plan, where to execute, and where to review in under 10 seconds.

## Phase 3 - Planning Workspace (Notes/Pages)

Goal: add page-wise planning and writing surface.

- Introduce `Pages` (lightweight, Notion-like writing workspace).
- Link pages to goals, weeks, and quarters.
- Provide starter templates for yearly and quarterly planning.

Exit criteria:

- Users can create and organize freeform planning notes without leaving the app.

## Phase 4 - Depth and Differentiation

Goal: improve outcomes and retention.

- Build Today Command Center with guided next action.
- Deepen accountability/coaching features or reduce claim scope in marketing.
- Add measurable onboarding and activation milestones.

Exit criteria:

- Clear increase in weekly engagement and completion behaviors.
