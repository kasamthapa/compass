import { PagePlaceholder } from '../components/PagePlaceholder'
import { IconInsights } from '../components/icons'

export function InsightsPage() {
  return (
    <PagePlaceholder
      title="Insights"
      icon={IconInsights}
      emptyTitle="Nothing to show yet"
      emptyMessage="Patterns will surface here over time."
    />
  )
}
