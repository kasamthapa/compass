import type { ComponentType } from 'react'

interface EmptyStateProps {
  icon: ComponentType<{ className?: string }>
  title: string
  message: string
}

export function EmptyState({ icon: Icon, title, message }: EmptyStateProps) {
  return (
    <div className="rounded-lg bg-surface px-6 py-9 text-center shadow-card">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-bg text-text-faint">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-headline text-text">{title}</p>
      <p className="mx-auto mt-1.5 max-w-xs text-subhead text-text-muted">{message}</p>
    </div>
  )
}
