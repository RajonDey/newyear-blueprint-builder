/**
 * Today's prompt library.
 *
 * Each day of the year resolves to one prompt via `getTodayPrompt(date, tz)`.
 * The selection is **deterministic** — same day-of-year always returns the
 * same prompt — so two devices, two reloads, and two cached server responses
 * never disagree. We rotate using a fixed array (no `Math.random`).
 *
 * Categories rotate roughly weekly:
 *   Mon/Fri — "look forward" prompts (intention, the next move)
 *   Tue/Thu — "look back" prompts (lessons, what served you)
 *   Wed     — "look in"   prompts (state of mind, body, relationships)
 *   Sat/Sun — "look out"  prompts (gratitude, connection, season)
 *
 * The prompts themselves are written to feel like a thoughtful friend asking
 * the question — not a productivity coach. Keep them short. Keep them open.
 */

import { getYmdInTimeZone } from "@/lib/systems-period"

const PROMPTS = [
  // ── Look forward (intention / next move)
  "What is the one thing that, if done today, would make today worthwhile?",
  "What does \"enough\" look like for today?",
  "Where will you start so the rest of the day flows?",
  "What's the smallest move that would still count as progress?",
  "Which conversation, if you had it today, would change something?",
  "What deserves your patience today — even when it's slow?",
  "What would you do today if you weren't trying to prove anything?",
  "What's worth protecting in your schedule today?",
  "If today were already a good day, what would have happened by tonight?",
  "What would help you start with calm instead of noise?",

  // ── Look back (lessons / what served you)
  "What did yesterday teach you that today should remember?",
  "What did you not do yesterday that you're glad about?",
  "Where did you push when you should have paused — and the other way around?",
  "Which thought from yesterday is still pulling at you?",
  "What surprised you this week?",
  "What did you learn the hard way recently?",
  "What pattern keeps showing up — and is it still useful?",
  "Which decision from last week feels right today?",
  "What did your past self do well that present-you forgets?",
  "What worked yesterday that you can carry into today?",

  // ── Look in (body / mind / heart)
  "How is your body, plainly?",
  "What do you need right now that you haven't named?",
  "Where is the resistance — and what is it pointing to?",
  "If you sat in silence for ten minutes, what would surface?",
  "What thought keeps repeating? Is it true?",
  "What are you avoiding — and what would it cost to face it?",
  "Where in your life do you feel most yourself this week?",
  "When did you last feel calm? What was happening?",
  "What's the difference between being busy and being useful today?",
  "What story are you telling yourself that needs editing?",

  // ── Look out (gratitude / season / others)
  "Who has been on your mind that you haven't reached out to?",
  "What did someone do for you recently that quietly mattered?",
  "What about this season — actual weather, light, work — are you grateful for?",
  "What's one small kindness you could offer today?",
  "Whose attention or care has shaped your week?",
  "What's becoming easier that used to be hard?",
  "What is the world giving you, freely, that you usually overlook?",
  "Who in your life keeps you honest?",
  "What's one thing you'll remember about this week in five years?",
  "What about your work, even on a slow day, do you respect?",

  // ── A second rotation (so 60+ total across the year)
  "What does today ask of you — gently — that you haven't agreed to yet?",
  "If you trusted yourself completely, what would you do first?",
  "What's the version of today that would feel honest at bedtime?",
  "What would it mean to be on your own side today?",
  "Where can you slow down by 10% and lose nothing?",
  "What's worth saying yes to right now? What's worth saying no to?",
  "If you knew this season had a quiet gift in it, what might it be?",
  "What in your work today deserves your full attention?",
  "Which relationship in your life is asking for a gesture, however small?",
  "What's the worry doing for you — and what would replace it if you let it go?",
  "What would today look like if you didn't have to earn it?",
  "What part of your routine quietly keeps you steady?",
  "What did you nearly miss yesterday because you were rushing?",
  "Whose voice is in your head this morning — and is it yours?",
  "If you could only do three things today, which three?",
  "What would feel like an act of friendship to yourself today?",
  "What's the truer version of your to-do list?",
  "Where in your life are you living from values instead of fears this week?",
  "What's a small ritual that's been carrying you?",
  "What do you want to remember about this morning in particular?",
] as const

export interface TodayPrompt {
  /** 0-indexed position in the prompt array; useful for analytics + debugging. */
  index: number
  /** The prompt text. */
  text: string
}

/** Compute day-of-year (1–366) in the user's timezone. */
function dayOfYear(date: Date, timeZone: string): number {
  const ymd = getYmdInTimeZone(date, timeZone)
  const [yearStr, monthStr, dayStr] = ymd.split("-")
  const year = parseInt(yearStr, 10)
  const month = parseInt(monthStr, 10)
  const day = parseInt(dayStr, 10)
  // UTC math is fine here — we only need a stable ordinal, not a wall-clock date.
  const start = Date.UTC(year, 0, 0)
  const target = Date.UTC(year, month - 1, day)
  return Math.floor((target - start) / 86_400_000)
}

/** Returns the deterministic prompt for the given date in the given timezone. */
export function getTodayPrompt(date: Date, timeZone: string): TodayPrompt {
  const idx = (dayOfYear(date, timeZone) - 1 + PROMPTS.length) % PROMPTS.length
  return { index: idx, text: PROMPTS[idx] }
}
