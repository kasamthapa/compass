import { PagePlaceholder } from '../components/PagePlaceholder'
import { IconWeek } from '../components/icons'

export function WeekPage() {
  return (
    <PagePlaceholder
      title="Week"
      icon={IconWeek}
      emptyTitle="A quiet week"
      emptyMessage="Your weekly priorities will appear here."
    />
  )
}
