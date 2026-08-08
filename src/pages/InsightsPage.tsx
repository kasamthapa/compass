import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { PageHeader } from '../components/PageHeader'
import { YearGrain } from '../components/today/YearGrain'
import { HabitConsistency } from '../components/insights/HabitConsistency'
import { WeekScoreTrend } from '../components/insights/WeekScoreTrend'
import { MoodEnergyTrend } from '../components/insights/MoodEnergyTrend'
import { QuietObservation } from '../components/insights/QuietObservation'
import * as reviewsRepo from '../db/repo/reviews'
import { todayISO } from '../lib/dates'

export function InsightsPage() {
  const today = todayISO()
  const year = new Date().getFullYear()

  const completedReviews = useLiveQuery(
    () => reviewsRepo.getCompletedDailyReviews(`${year}-01-01`, `${year}-12-31`),
    [year],
  )
  const scoresByDate = useMemo(() => {
    const map = new Map<string, 1 | 2 | 3 | 4 | 5 | undefined>()
    for (const review of completedReviews ?? []) {
      map.set(review.periodKey, review.score)
    }
    return map
  }, [completedReviews])

  return (
    <div>
      <PageHeader title="Insights" />

      <QuietObservation />

      <section className="mt-8">
        <h2 className="font-display text-title text-text">This year</h2>
        <div className="mt-4 rounded-lg bg-surface px-4 py-4 shadow-card">
          <YearGrain today={today} scoresByDate={scoresByDate} />
        </div>
      </section>

      <HabitConsistency />
      <WeekScoreTrend />
      <MoodEnergyTrend />
    </div>
  )
}
