import { useLiveQuery } from 'dexie-react-hooks'
import * as reviewsRepo from '../../db/repo/reviews'
import { addDays, formatWeekRange, todayISO, weekOf } from '../../lib/dates'
import { EmptyState } from '../EmptyState'
import { IconInsights } from '../icons'

const WEEKS_SHOWN = 12
const CHART_HEIGHT = 80
const CHART_WIDTH = 320

/** A simple line-and-dots trend of weekly-review scores over the last
 * WEEKS_SHOWN weeks — plain SVG, token-driven, no chart library. */
export function WeekScoreTrend() {
  const endWeek = weekOf(todayISO())
  const startWeek = addDays(endWeek, -7 * (WEEKS_SHOWN - 1))
  const reviews = useLiveQuery(
    () => reviewsRepo.getCompletedWeeklyReviews(startWeek, endWeek),
    [startWeek, endWeek],
  )
  const scored = (reviews ?? []).filter((r) => r.score !== undefined) as {
    periodKey: string
    score: 1 | 2 | 3 | 4 | 5
    completedAt: string
  }[]

  const points = scored.map((review, index) => {
    const x = scored.length > 1 ? (index / (scored.length - 1)) * CHART_WIDTH : CHART_WIDTH / 2
    const y = CHART_HEIGHT - ((review.score - 1) / 4) * CHART_HEIGHT
    return { x, y, review }
  })
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

  return (
    <section className="mt-8">
      <h2 className="font-display text-title text-text">Week scores</h2>
      <div className="mt-4 rounded-lg bg-surface px-5 py-5 shadow-card">
        {scored.length === 0 ? (
          <EmptyState
            icon={IconInsights}
            title="Nothing to show yet"
            message="Finish a weekly review and its score will start a trend here."
          />
        ) : (
          <>
            <svg
              viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              className="h-20 w-full overflow-visible"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <line
                x1="0"
                y1={CHART_HEIGHT}
                x2={CHART_WIDTH}
                y2={CHART_HEIGHT}
                stroke="var(--hairline)"
                strokeWidth="1"
              />
              {points.length > 1 && <path d={path} fill="none" stroke="var(--chart-blue)" strokeWidth="1.75" />}
              {points.map((p) => (
                <circle key={p.review.periodKey} cx={p.x} cy={p.y} r="2.5" fill="var(--chart-blue)" />
              ))}
            </svg>
            <div className="mt-2 flex items-center justify-between font-mono text-caption-2 text-text-faint">
              <span>{formatWeekRange(scored[0].periodKey)}</span>
              <span>{formatWeekRange(scored[scored.length - 1].periodKey)}</span>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
