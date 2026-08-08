import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import * as journalRepo from '../../db/repo/journal'
import { formatMonthYear, getMonthGridDays, monthKey, todayISO } from '../../lib/dates'
import { IconChevronRight } from '../icons'

const WEEKDAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

interface JournalCalendarProps {
  month: string
  selectedDate: string
  onSelectDate: (date: string) => void
  onNavigateMonth: (delta: number) => void
}

export function JournalCalendar({ month, selectedDate, onSelectDate, onNavigateMonth }: JournalCalendarProps) {
  const entries = useLiveQuery(() => journalRepo.getForMonth(month), [month]) ?? []
  const datesWithEntry = useMemo(() => new Set(entries.map((entry) => entry.date)), [entries])
  const gridDays = useMemo(() => getMonthGridDays(month), [month])
  const today = todayISO()

  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onNavigateMonth(-1)}
          aria-label="Previous month"
          className="ios-press flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-text-faint"
        >
          <IconChevronRight className="h-4 w-4 rotate-180" />
        </button>
        <p className="font-mono text-subhead text-text-muted">{formatMonthYear(month)}</p>
        <button
          type="button"
          onClick={() => onNavigateMonth(1)}
          aria-label="Next month"
          className="ios-press flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-text-faint"
        >
          <IconChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((label) => (
          <p key={label} className="py-1 text-center font-mono text-caption-2 text-text-faint">
            {label}
          </p>
        ))}
        {gridDays.map((day) => {
          const inMonth = monthKey(day) === month
          const isToday = day === today
          const isSelected = day === selectedDate
          const hasEntry = datesWithEntry.has(day)

          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelectDate(day)}
              aria-current={isToday ? 'date' : undefined}
              aria-pressed={isSelected}
              className={`ios-press flex min-h-11 flex-col items-center justify-center gap-1 rounded-md py-1 transition-colors duration-150 ease-ios ${
                isSelected ? 'bg-accent-wash' : ''
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full font-mono text-caption ${
                  isToday ? 'ring-1 ring-accent-ring' : ''
                } ${isSelected ? 'font-semibold text-accent-text' : inMonth ? 'text-text' : 'text-text-faint'}`}
              >
                {Number(day.slice(-2))}
              </span>
              <span
                aria-hidden="true"
                className={`h-1 w-1 rounded-full ${hasEntry ? 'bg-accent' : 'bg-transparent'}`}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
