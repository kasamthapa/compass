import { PagePlaceholder } from '../components/PagePlaceholder'
import { IconJournal } from '../components/icons'

export function JournalPage() {
  return (
    <PagePlaceholder
      title="Journal"
      icon={IconJournal}
      emptyTitle="A blank page"
      emptyMessage="Today's reflections will live here."
    />
  )
}
