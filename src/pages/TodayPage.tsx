import { PagePlaceholder } from '../components/PagePlaceholder'
import { IconToday } from '../components/icons'

export function TodayPage() {
  return (
    <PagePlaceholder
      title="Today"
      icon={IconToday}
      emptyTitle="Nothing planned yet"
      emptyMessage="Your day will show up here once it begins."
    />
  )
}
