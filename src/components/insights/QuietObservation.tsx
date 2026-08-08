import { useLiveQuery } from 'dexie-react-hooks'
import * as habitsRepo from '../../db/repo/habits'
import * as reviewsRepo from '../../db/repo/reviews'
import { addDays, todayISO, weekOf } from '../../lib/dates'
import { computeObservation, MIN_PAIRED_WEEKS, type WeekPoint } from '../../lib/insights'

const WEEKS_CONSIDERED = 12

/**
 * The one computed "here's a pattern" moment on Insights — see
 * lib/insights.ts for the thresholds. Renders nothing at all once there's
 * enough history but no notable pattern (silence is the correct answer
 * there, not a forced observation); renders a calm "not enough yet" card
 * only while there's genuinely too little data to say anything.
 */
export function QuietObservation() {
  const endWeek = weekOf(todayISO())
  const startWeek = addDays(endWeek, -7 * (WEEKS_CONSIDERED - 1))

  const habits = useLiveQuery(() => habitsRepo.getActiveAndPaused(), [])
  const reviews = useLiveQuery(
    () => reviewsRepo.getCompletedWeeklyReviews(startWeek, endWeek),
    [startWeek, endWeek],
  )

  const points = useLiveQuery(async () => {
    if (!habits || !reviews) return undefined
    if (habits.length === 0 || reviews.length === 0) return []
    const results: WeekPoint[] = []
    for (const review of reviews) {
      if (review.score === undefined) continue
      const rates = await Promise.all(habits.map((habit) => habitsRepo.weeklyHitRate(habit.id, review.periodKey)))
      const validRates = rates.filter((rate) => rate.target > 0)
      if (validRates.length === 0) continue
      const completionRate =
        validRates.reduce((sum, rate) => sum + Math.min(rate.done / rate.target, 1), 0) / validRates.length
      results.push({ weekOf: review.periodKey, score: review.score, completionRate })
    }
    return results
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habits, reviews])

  if (points === undefined) return null // still loading

  if (points.length < MIN_PAIRED_WEEKS) {
    return (
      <section className="mt-8">
        <div className="rounded-lg bg-surface px-5 py-4 shadow-card">
          <p className="text-subhead text-text-muted">
            Patterns will show up here once there are a few weeks of reviews and habits to look back on.
          </p>
        </div>
      </section>
    )
  }

  const observation = computeObservation(points)
  if (!observation) return null

  return (
    <section className="mt-8">
      <div className="rounded-lg bg-accent-wash px-5 py-4 shadow-card">
        <p className="font-mono text-caption-2 uppercase tracking-wide text-text-faint">A quiet observation</p>
        <p className="mt-1.5 text-body text-text">{observation}</p>
      </div>
    </section>
  )
}
