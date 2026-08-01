import { formatHeaderDate } from '../../lib/dates'
import { YearGrain } from './YearGrain'

interface TodayHeaderProps {
  today: string
  greeting: string
  scoresByDate: Map<string, 1 | 2 | 3 | 4 | 5 | undefined>
  onStuck: () => void
}

export function TodayHeader({ today, greeting, scoresByDate, onStuck }: TodayHeaderProps) {
  return (
    <div className="pb-6">
      <p className="font-mono text-caption uppercase tracking-wide text-text-faint">
        {formatHeaderDate(today)}
      </p>
      <div className="mt-0.5 flex items-center justify-between gap-3">
        <p className="text-subhead text-text-muted">{greeting}</p>
        <button
          type="button"
          onClick={onStuck}
          className="ios-press shrink-0 rounded-full bg-surface px-3 py-1.5 text-caption font-medium text-text-faint"
        >
          Stuck?
        </button>
      </div>
      <div className="mt-4">
        <YearGrain today={today} scoresByDate={scoresByDate} />
      </div>
    </div>
  )
}
