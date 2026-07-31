import { formatHeaderDate } from '../../lib/dates'
import { YearGrain } from './YearGrain'

interface TodayHeaderProps {
  today: string
  greeting: string
  scoresByDate: Map<string, 1 | 2 | 3 | 4 | 5 | undefined>
}

export function TodayHeader({ today, greeting, scoresByDate }: TodayHeaderProps) {
  return (
    <div className="pb-6">
      <p className="font-mono text-caption uppercase tracking-wide text-text-faint">
        {formatHeaderDate(today)}
      </p>
      <p className="mt-0.5 text-subhead text-text-muted">{greeting}</p>
      <div className="mt-4">
        <YearGrain today={today} scoresByDate={scoresByDate} />
      </div>
    </div>
  )
}
