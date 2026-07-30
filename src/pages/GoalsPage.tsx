import { PagePlaceholder } from '../components/PagePlaceholder'
import { IconGoals } from '../components/icons'

export function GoalsPage() {
  return (
    <PagePlaceholder
      title="Goals"
      icon={IconGoals}
      emptyTitle="No goals yet"
      emptyMessage="The big picture starts here when you're ready."
    />
  )
}
