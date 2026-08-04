import { useState } from 'react'
import { Sheet } from '../components/Sheet'
import { JournalCalendar } from '../components/journal/JournalCalendar'
import { JournalEditor } from '../components/journal/JournalEditor'
import { IconClock } from '../components/icons'
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
        <button
          type="button"
          onClick={() => setHistoryOpen(true)}
          className="ios-press flex min-h-11 items-center gap-1.5 rounded-full bg-surface px-3.5 py-2 text-caption font-medium text-text-muted shadow-card"
        >
          <IconClock className="h-4 w-4" />
          History
        </button>
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
