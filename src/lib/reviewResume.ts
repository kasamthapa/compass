import type { Review } from '../types/models'

/** Which step of the 4-step daily review to resume at, based on what's already been answered. */
export function resumeStepFor(
  review: Pick<Review, 'score' | 'answers'> | undefined,
): 1 | 2 | 3 | 4 {
  if (!review || review.score === undefined) return 1
  if (!review.answers.win) return 2
  if (!review.answers.lesson) return 3
  return 4
}

/** Answers-bag key prefix for a per-goal check-in note on the weekly review. */
export const GOAL_NOTE_ANSWER_PREFIX = 'goal:'

/**
 * Which step of the 5-step weekly review to resume at. Unlike the daily
 * review, three of the five steps (inbox, this week's priorities, next
 * week's priorities) are action steps with no dedicated field on the
 * Review record to infer progress from — only the goal check-in notes
 * (stored in `answers`) and the score are trackable signals. So this is a
 * coarser heuristic than the daily review's, not a precise per-step
 * resume: no review yet (or nothing recorded at all) restarts at step 1
 * (cheap to skim back through — the inbox/priority steps show a calm
 * "already clear"/empty state instantly if there's nothing left to do);
 * any goal note present resumes at step 4 (rate the week); a score
 * resumes at step 5 (next week's priorities), the last step. See
 * DECISIONS.md.
 */
export function resumeStepForWeekly(
  review: Pick<Review, 'score' | 'answers'> | undefined,
): 1 | 2 | 3 | 4 | 5 {
  if (!review) return 1
  if (review.score !== undefined) return 5
  const hasGoalNote = Object.keys(review.answers).some((key) => key.startsWith(GOAL_NOTE_ANSWER_PREFIX))
  if (hasGoalNote) return 4
  return 1
}

/**
 * Which step of the 3-step monthly review to resume at. Steps 1 (audit
 * this month's milestones) and 3 (next month's milestones) are action
 * steps against the `milestones` table with no trace on the `Review`
 * record — same reasoning as the weekly review's coarser heuristic (see
 * DECISIONS.md). Only `score` is trackable, so: no review yet → step 1;
 * a score exists → step 3 (the last step); otherwise → step 1.
 */
export function resumeStepForMonthly(
  review: Pick<Review, 'score' | 'answers'> | undefined,
): 1 | 2 | 3 {
  if (!review) return 1
  if (review.score !== undefined) return 3
  return 1
}

/** Answers-bag keys for the yearly review's reflection step. */
export const YEAR_REFLECT_ANSWER_KEYS = ['biggestWin', 'biggestLesson', 'stopStartContinue'] as const

/**
 * Which step of the 3-step yearly review to resume at. Mirrors the
 * weekly review's shape: no review yet → step 1; any reflection answer
 * present → step 2 (rate the year); a score exists → step 3 (set next
 * year's goals, the last step — this one has no trackable field either,
 * same reasoning as the weekly/monthly action steps).
 */
export function resumeStepForYearly(
  review: Pick<Review, 'score' | 'answers'> | undefined,
): 1 | 2 | 3 {
  if (!review) return 1
  if (review.score !== undefined) return 3
  const hasReflection = YEAR_REFLECT_ANSWER_KEYS.some((key) => Boolean(review.answers[key]))
  if (hasReflection) return 2
  return 1
}
