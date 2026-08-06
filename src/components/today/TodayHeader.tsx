import { formatHeaderDate } from '../../lib/dates'
import { IconLifebuoy } from '../icons'
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-caption uppercase tracking-wide text-text-faint">
            {formatHeaderDate(today)}
          </p>
          <p className="mt-0.5 text-subhead text-text-muted">{greeting}</p>
        </div>
        <button
          type="button"
          onClick={onStuck}
          className="ios-press flex shrink-0 items-center gap-1.5 rounded-full bg-accent-wash py-2 pl-2.5 pr-3.5 text-caption font-medium text-accent-text"
        >
          <IconLifebuoy className="h-4 w-4" />
          Stuck?
        </button>
      </div>
      <div className="mt-4">
        <YearGrain today={today} scoresByDate={scoresByDate} />
      </div>
    </div>
  )
}
