import { formatHeaderDate } from '../../lib/dates'
import { YearGrain } from './YearGrain'

interface TodayHeaderProps {
  today: string
  greeting: string
  completedDates: Set<string>
}

export function TodayHeader({ today, greeting, completedDates }: TodayHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 pb-6">
      <div>
        <p className="font-mono text-caption uppercase tracking-wide text-text-faint">
          {formatHeaderDate(today)}
        </p>
        <p className="mt-0.5 text-subhead text-text-muted">{greeting}</p>
      </div>
      <YearGrain today={today} completedDates={completedDates} />
    </div>
  )
}
