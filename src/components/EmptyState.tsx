import type { ComponentType } from 'react'

interface EmptyStateProps {
  icon: ComponentType<{ className?: string }>
  title: string
  message: string
}

export function EmptyState({ icon: Icon, title, message }: EmptyStateProps) {
  return (
    <div className="mx-auto mt-10 flex max-w-[15rem] flex-col items-center text-center sm:mt-14">
      <div className="mb-3.5 flex h-11 w-11 items-center justify-center rounded-full bg-surface text-text-faint">
        <Icon className="h-5 w-5" />
      </div>
      <p className="font-display text-headline text-text">{title}</p>
      <p className="mt-1 text-subhead text-text-muted">{message}</p>
    </div>
  )
}
