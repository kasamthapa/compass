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
