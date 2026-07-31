import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { addDays, parseDateISO } from '../../lib/dates'

interface YearGrainProps {
  today: string
  completedDates: Set<string>
}

/** Jan 1 .. Dec 31 of `today`'s year, prefixed with blank spacers so the grid's
 * column-major auto-flow lines each date up with its correct weekday row. */
function buildYearCells(today: string): string[] {
  const year = parseDateISO(today).getFullYear()
  const jan1 = `${year}-01-01`
  const dec31 = `${year}-12-31`
  const weekday = parseDateISO(jan1).getDay() // 0 = Sun .. 6 = Sat
  const mondayIndexed = weekday === 0 ? 6 : weekday - 1 // Mon = 0 .. Sun = 6
  const spacers = Array.from({ length: mondayIndexed }, () => '')

  const dates: string[] = []
  let cursor = jan1
  while (cursor <= dec31) {
    dates.push(cursor)
    cursor = addDays(cursor, 1)
  }
  return [...spacers, ...dates]
}

export function YearGrain({ today, completedDates }: YearGrainProps) {
  const navigate = useNavigate()
  const cells = useMemo(() => buildYearCells(today), [today])

  return (
    <button
      type="button"
      onClick={() => navigate('/insights')}
      aria-label="View insights"
      className="ios-press grid gap-[1px] rounded-sm p-1"
      style={{ gridTemplateRows: 'repeat(7, 3px)', gridAutoFlow: 'column', gridAutoColumns: '3px' }}
    >
      {cells.map((date, index) => {
        if (date === '') {
          return <span key={index} aria-hidden="true" className="invisible h-[3px] w-[3px]" />
        }
        const isToday = date === today
        const isCompleted = completedDates.has(date)
        const isFuture = date > today
        const fill = isCompleted ? 'bg-good' : isFuture ? 'bg-transparent' : 'bg-border-hairline'
        const ring = isToday ? 'outline outline-1 outline-accent outline-offset-[1px]' : ''
        return (
          <span
            key={index}
            aria-hidden="true"
            className={`h-[3px] w-[3px] rounded-[1px] ${fill} ${ring}`}
          />
        )
      })}
    </button>
  )
}
