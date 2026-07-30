import type { ComponentType } from 'react'
import { PageHeader } from './PageHeader'
import { EmptyState } from './EmptyState'

interface PagePlaceholderProps {
  title: string
  icon: ComponentType<{ className?: string }>
  emptyTitle: string
  emptyMessage: string
}

export function PagePlaceholder({ title, icon, emptyTitle, emptyMessage }: PagePlaceholderProps) {
  return (
    <div>
      <PageHeader title={title} />
      <EmptyState icon={icon} title={emptyTitle} message={emptyMessage} />
    </div>
  )
}
