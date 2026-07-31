import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { parseDateISO } from '../../lib/dates'

interface YearGrainProps {
  today: string
  scoresByDate: Map<string, 1 | 2 | 3 | 4 | 5 | undefined>
}

const CELL_PX = 9
const GAP_PX = 1.5

/** One array of date strings per month (Jan .. Dec) of `today`'s year. */
function buildYearMonths(today: string): string[][] {
  const year = parseDateISO(today).getFullYear()
  const months: string[][] = []
  for (let month = 0; month < 12; month++) {
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days: string[] = []
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)
    }
    months.push(days)
  }
  return months
}

/** Score 1 -> faint ink tint, score 5 -> fully saturated ink. */
function intensityForScore(score: 1 | 2 | 3 | 4 | 5 | undefined): number {
  const value = score ?? 3
  return 0.28 + (value - 1) * 0.18
}

export function YearGrain({ today, scoresByDate }: YearGrainProps) {
  const navigate = useNavigate()
  const months = useMemo(() => buildYearMonths(today), [today])

  return (
    <button
      type="button"
      onClick={() => navigate('/insights')}
      aria-label="View insights"
      className="ios-press flex flex-col rounded-sm"
      style={{ gap: `${GAP_PX}px` }}
    >
      {months.map((days, monthIndex) => (
        <div key={monthIndex} className="flex" style={{ gap: `${GAP_PX}px` }}>
          {days.map((date) => {
            const isToday = date === today
            const score = scoresByDate.get(date)
            const isCompleted = scoresByDate.has(date)
            const ring = isToday ? 'outline outline-1 outline-accent outline-offset-[1px]' : ''

            return (
              <span
                key={date}
                aria-hidden="true"
                className={`rounded-[2px] ${isCompleted ? '' : 'bg-grid-empty'} ${ring}`}
                style={{
                  height: CELL_PX,
                  width: CELL_PX,
                  backgroundColor: isCompleted ? 'var(--ink)' : undefined,
                  opacity: isCompleted ? intensityForScore(score) : undefined,
                }}
              />
            )
          })}
        </div>
      ))}
    </button>
  )
}
