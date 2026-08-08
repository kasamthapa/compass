import { useLiveQuery } from 'dexie-react-hooks'
import * as habitsRepo from '../../db/repo/habits'
import { addDays, todayISO, toDateISO, weekOf } from '../../lib/dates'
import { habitTrend, trendLabel, type WeeklyRate } from '../../lib/insights'
import { EmptyState } from '../EmptyState'
import { IconRepeat } from '../icons'
import type { Habit } from '../../types/models'

const WEEKS_SHOWN = 12
const BAR_MIN_HEIGHT = 4
const BAR_MAX_HEIGHT = 28

/** Weekly hit-rates for one habit, oldest-first, starting no earlier than
 * the week the habit was created (a habit that didn't exist yet isn't "0%
 * that week" — it just isn't plotted). Capped at the most recent
 * WEEKS_SHOWN weeks. */
function useHabitWeeklyRates(habit: Habit): WeeklyRate[] | undefined {
  const currentWeek = weekOf(todayISO())
  const createdWeek = weekOf(toDateISO(new Date(habit.createdAt)))

  return useLiveQuery(async () => {
    const allWeeks: string[] = []
    let cursor = createdWeek
    while (cursor <= currentWeek) {
      allWeeks.push(cursor)
      cursor = addDays(cursor, 7)
    }
    const weeks = allWeeks.slice(-WEEKS_SHOWN)
    return Promise.all(
      weeks.map(async (weekOfDate) => {
        const { done, target } = await habitsRepo.weeklyHitRate(habit.id, weekOfDate)
        return { weekOf: weekOfDate, rate: target > 0 ? Math.min(done / target, 1) : 0 }
      }),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habit.id, currentWeek])
}

function HabitRow({ habit }: { habit: Habit }) {
  const rates = useHabitWeeklyRates(habit)
  const trend = rates ? habitTrend(rates) : null

  return (
    <div className="py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 flex-1 truncate text-body text-text">
          {habit.name}
          {habit.status === 'paused' && <span className="ml-1.5 text-caption text-text-faint">(paused)</span>}
        </p>
        {trend && <span className="shrink-0 font-mono text-caption text-text-muted">{trendLabel(trend)}</span>}
      </div>
      <div className="mt-2.5 flex h-[28px] items-end gap-[3px]">
        {(rates ?? []).map((week) => (
          <span
            key={week.weekOf}
            aria-hidden="true"
            className={`min-w-0 flex-1 rounded-[2px] ${week.rate >= 1 ? 'bg-good' : 'bg-grid-empty'}`}
            style={{ height: `${BAR_MIN_HEIGHT + week.rate * (BAR_MAX_HEIGHT - BAR_MIN_HEIGHT)}px` }}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * A 12-week hit-rate strip per active/paused habit, plus a plain-language
 * trend word — never a streak count (see lib/insights.ts and CLAUDE.md).
 * Weeks that met the habit's target render in --good; every other week
 * renders in a neutral tone — brass never appears here, per the scarcity
 * rule (brass is reserved for today/active/completion moments elsewhere).
 */
export function HabitConsistency() {
  const habits = useLiveQuery(() => habitsRepo.getActiveAndPaused(), []) ?? []

  return (
    <section className="mt-8">
      <h2 className="font-display text-title text-text">Habit consistency</h2>
      <div className="mt-4 rounded-lg bg-surface px-4 shadow-card">
        {habits.length === 0 ? (
          <EmptyState
            icon={IconRepeat}
            title="Nothing to show yet"
            message="Once you're logging habits, their weekly rhythm will show up here."
          />
        ) : (
          <div className="divide-y divide-border-hairline">
            {habits.map((habit) => (
              <HabitRow key={habit.id} habit={habit} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
