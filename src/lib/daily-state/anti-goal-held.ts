/**
 * Legacy reflection prefix + column helpers for DailyState anti-goal pill.
 *
 * Before PC-09, held/slipped was encoded as:
 *   `anti-goal:<antiGoalId>=held|slipped\n\n<reflection>`
 *
 * New rows use `antiGoalHeldId` + `antiGoalHeld`. The parser remains for
 * read-time fallback until all environments have run the backfill migration.
 */

/** SQL backfill pattern (documented for migration parity). */
export const LEGACY_ANTIGOAL_PREFIX_SQL =
  '^anti-goal:([^=\n]+)=(held|slipped)\n\n'

/** JS RegExp equivalent of the SQL backfill pattern. */
export const LEGACY_ANTIGOAL_PREFIX_JS =
  /^anti-goal:([^=\n]+)=(held|slipped)\n\n/

export type AntiGoalHeldChoice = "held" | "slipped"

export function parseLegacyAntiGoalReflection(raw: string | null): {
  antiGoalId: string | null
  antiHeld: AntiGoalHeldChoice | null
  text: string
} {
  if (!raw) return { antiGoalId: null, antiHeld: null, text: "" }
  const m = LEGACY_ANTIGOAL_PREFIX_JS.exec(raw)
  if (!m) return { antiGoalId: null, antiHeld: null, text: raw }
  return {
    antiGoalId: m[1],
    antiHeld: m[2] as AntiGoalHeldChoice,
    text: raw.slice(m[0].length),
  }
}

export function resolveAntiGoalHeldForPill(args: {
  rotatingAntiGoalId: string | null
  antiGoalHeldId: string | null | undefined
  antiGoalHeld: boolean | null | undefined
  reflection: string | null | undefined
}): AntiGoalHeldChoice | null {
  const { rotatingAntiGoalId } = args
  if (!rotatingAntiGoalId) return null

  if (
    args.antiGoalHeldId === rotatingAntiGoalId &&
    args.antiGoalHeld !== null &&
    args.antiGoalHeld !== undefined
  ) {
    return args.antiGoalHeld ? "held" : "slipped"
  }

  const legacy = parseLegacyAntiGoalReflection(args.reflection ?? null)
  if (legacy.antiGoalId === rotatingAntiGoalId && legacy.antiHeld) {
    return legacy.antiHeld
  }

  return null
}

export function resolveReflectionText(reflection: string | null | undefined): string {
  return parseLegacyAntiGoalReflection(reflection ?? null).text
}

/** PC-20 analytics stub — aggregate held vs slipped counts since a date. */
export type AntiGoalHeldStats = {
  held: number
  slipped: number
  answered: number
}

export function summarizeAntiGoalHeldRows(
  rows: { antiGoalHeld: boolean | null }[],
): AntiGoalHeldStats {
  let held = 0
  let slipped = 0
  for (const row of rows) {
    if (row.antiGoalHeld === true) held += 1
    else if (row.antiGoalHeld === false) slipped += 1
  }
  return { held, slipped, answered: held + slipped }
}
