import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { PageHeader } from '../components/PageHeader'
import { TodayHeader } from '../components/today/TodayHeader'
import { TodayFocus } from '../components/today/TodayFocus'
import { TodayHabits } from '../components/today/TodayHabits'
import { EveningReviewCard } from '../components/today/EveningReviewCard'
import { EveningReviewDialog } from '../components/today/EveningReviewDialog'
import * as reviewsRepo from '../db/repo/reviews'
import { toDateISO, addDays, weekOf } from '../lib/dates'
import { useNow } from '../lib/useNow'

function greetingFor(hour: number): string {
  if (hour < 12) return 'Good morning.'
  if (hour < 18) return 'Good afternoon.'
  return 'Good evening.'
}

export function TodayPage() {
  const now = useNow()
  const today = toDateISO(now)
  const tomorrow = addDays(today, 1)
  const weekStart = weekOf(today)
  const year = now.getFullYear()

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)

  const dailyReview = useLiveQuery(() => reviewsRepo.getByPeriod('daily', today), [today])
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

  const isEvening = now.getHours() >= 18
  const showEveningCard = isEvening && !dailyReview?.completedAt

  return (
    <div>
      <PageHeader title="Today" />
      <TodayHeader today={today} greeting={greetingFor(now.getHours())} scoresByDate={scoresByDate} />
      <TodayFocus today={today} />
      <TodayHabits today={today} weekStart={weekStart} />
      {showEveningCard && <EveningReviewCard onOpen={() => setReviewDialogOpen(true)} />}
      <EveningReviewDialog
        isOpen={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        today={today}
        tomorrow={tomorrow}
      />
    </div>
  )
}
