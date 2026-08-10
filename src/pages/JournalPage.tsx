import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Sheet } from '../components/Sheet'
import { JournalCalendar } from '../components/journal/JournalCalendar'
import { JournalEditor } from '../components/journal/JournalEditor'
import { IconClock, IconSettings } from '../components/icons'
import { addMonths, monthKey, todayISO } from '../lib/dates'

export function JournalPage() {
  const today = todayISO()
  const [month, setMonth] = useState(() => monthKey(today))
  const [selectedDate, setSelectedDate] = useState(() => today)
  const [historyOpen, setHistoryOpen] = useState(false)

  function handleSelectDate(date: string) {
    setSelectedDate(date)
    setHistoryOpen(false)
  }

  return (
    <div>
      <header className="flex items-center justify-between gap-4 pb-2">
        <h1 className="font-display text-large-title text-text">Journal</h1>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setHistoryOpen(true)}
            className="ios-press flex min-h-11 items-center gap-1.5 rounded-full bg-surface px-3.5 py-2 text-caption font-medium text-text-muted shadow-card"
          >
            <IconClock className="h-4 w-4" />
            History
          </button>
          {/* Desktop reaches Settings via the left rail; this only needs to
              exist on mobile. Coexists with History rather than replacing
              it — see DECISIONS.md (Phase 7C). */}
          <NavLink
            to="/settings"
            aria-label="Settings"
            className={({ isActive }) =>
              `ios-press flex h-11 w-11 items-center justify-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent-ring md:hidden ${
                isActive ? 'text-accent' : 'text-text-muted'
              }`
            }
          >
            {({ isActive }) => <IconSettings className="h-5 w-5" active={isActive} />}
          </NavLink>
        </div>
      </header>

      <JournalEditor date={selectedDate} today={today} onBackToToday={() => setSelectedDate(today)} />

      <Sheet isOpen={historyOpen} onClose={() => setHistoryOpen(false)} ariaLabel="Journal history">
        <p className="mb-4 text-headline text-text">History</p>
        <JournalCalendar
          month={month}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          onNavigateMonth={(delta) => setMonth((current) => addMonths(current, delta))}
        />
      </Sheet>
    </div>
  )
}
