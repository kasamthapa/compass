import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { JournalCalendar } from '../components/journal/JournalCalendar'
import { JournalEditor } from '../components/journal/JournalEditor'
import { addMonths, monthKey, todayISO } from '../lib/dates'

export function JournalPage() {
  const [month, setMonth] = useState(() => monthKey(todayISO()))
  const [selectedDate, setSelectedDate] = useState(() => todayISO())

  return (
    <div>
      <PageHeader title="Journal" />
      <div className="mt-3">
        <JournalCalendar
          month={month}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onNavigateMonth={(delta) => setMonth((current) => addMonths(current, delta))}
        />
      </div>
      <JournalEditor date={selectedDate} />
    </div>
  )
}
