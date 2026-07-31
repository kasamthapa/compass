import { useLayoutEffect, useMemo, useRef } from 'react'
import { addDays, parseDateISO, weekOf } from '../../lib/dates'

interface YearGrainProps {
  today: string
  scoresByDate: Map<string, 1 | 2 | 3 | 4 | 5 | undefined>
}

// GitHub-contributions anatomy, but Monday-first to match the app's
// weekOf() convention (see DECISIONS.md).
//
// Cell size is a CSS custom property, not a fixed constant, because mobile
// and desktop want different things here: mobile keeps cells at a readable
// ~11px and scrolls horizontally, while desktop shrinks slightly to fit the
// full year inside the app's 720px content column without scrolling at all
// (see PROGRESS.md for the measured widths behind the md: value below).
const GRAIN_SIZE_CLASSES = '[--cell:11px] [--gap:2px] md:[--cell:9px] md:[--gap:1.5px]'
const CELL = 'var(--cell)'
const GAP = 'var(--gap)'
const MONTH_ROW_PX = 14
const WEEKDAY_ROW_LABELS = ['M', '', 'W', '', 'F', '', '']
const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

interface WeekColumn {
  /** Mon .. Sun; null where the day falls outside the current year. */
  days: (string | null)[]
  /** Month label to show above this column, if any date in it is the 1st. */
  monthLabel: string | null
}

function buildYearColumns(today: string): WeekColumn[] {
  const year = parseDateISO(today).getFullYear()
  const jan1 = `${year}-01-01`
  const dec31 = `${year}-12-31`
  const firstMonday = weekOf(jan1)

  const columns: WeekColumn[] = []
  let cursor = firstMonday
  while (cursor <= dec31) {
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(cursor, i)
      return date >= jan1 && date <= dec31 ? date : null
    })
    const firstOfMonth = days.find((date) => date?.endsWith('-01'))
    const monthLabel = firstOfMonth ? MONTH_LABELS[Number(firstOfMonth.slice(5, 7)) - 1] : null
    columns.push({ days, monthLabel })
    cursor = addDays(cursor, 7)
  }
  return columns
}

/** Score 1 -> faint ink tint, score 5 -> fully saturated ink. */
function intensityForScore(score: 1 | 2 | 3 | 4 | 5 | undefined): number {
  const value = score ?? 3
  return 0.28 + (value - 1) * 0.18
}

export function YearGrain({ today, scoresByDate }: YearGrainProps) {
  const columns = useMemo(() => buildYearColumns(today), [today])
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to the most recent weeks on load. A direct scrollLeft
  // assignment is an instant jump — there's no animated scroll to gate
  // behind prefers-reduced-motion in the first place.
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollLeft = el.scrollWidth
  }, [columns])

  return (
    <div className={`flex ${GRAIN_SIZE_CLASSES}`}>
      <div className="flex shrink-0 flex-col pr-1.5" style={{ gap: GAP }}>
        <div style={{ height: MONTH_ROW_PX }} />
        {WEEKDAY_ROW_LABELS.map((label, index) => (
          <div
            key={index}
            style={{ height: CELL }}
            className="flex items-center font-mono text-caption-2 text-text-faint"
          >
            {label}
          </div>
        ))}
      </div>

      <div ref={scrollRef} className="scroll-thin overflow-x-auto">
        <div className="flex flex-col" style={{ gap: GAP }}>
          <div className="flex" style={{ gap: GAP, height: MONTH_ROW_PX }}>
            {columns.map((column, index) => (
              <div key={index} className="relative shrink-0" style={{ width: CELL }}>
                {column.monthLabel && (
                  <span className="absolute left-0 top-0 whitespace-nowrap font-mono text-caption-2 text-text-faint">
                    {column.monthLabel}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="flex" style={{ gap: GAP }}>
            {columns.map((column, columnIndex) => (
              <div key={columnIndex} className="flex shrink-0 flex-col" style={{ gap: GAP }}>
                {column.days.map((date, row) => {
                  if (!date) {
                    return (
                      <span
                        key={row}
                        aria-hidden="true"
                        className="invisible"
                        style={{ height: CELL, width: CELL }}
                      />
                    )
                  }
                  const isToday = date === today
                  const score = scoresByDate.get(date)
                  const isCompleted = scoresByDate.has(date)
                  const ring = isToday ? 'outline outline-1 outline-accent outline-offset-[1px]' : ''

                  return (
                    <span
                      key={row}
                      aria-hidden="true"
                      className={`rounded-[2px] ${isCompleted ? '' : 'bg-grid-empty'} ${ring}`}
                      style={{
                        height: CELL,
                        width: CELL,
                        backgroundColor: isCompleted ? 'var(--ink)' : undefined,
                        opacity: isCompleted ? intensityForScore(score) : undefined,
                      }}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
