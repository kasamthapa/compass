import { PagePlaceholder } from '../components/PagePlaceholder'
import { IconInbox } from '../components/icons'

export function InboxPage() {
  return (
    <PagePlaceholder
      title="Inbox"
      icon={IconInbox}
      emptyTitle="All caught up"
      emptyMessage="Anything you capture will land here first."
    />
  )
}
